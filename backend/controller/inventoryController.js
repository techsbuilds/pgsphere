import ACCOUNT from "../models/ACCOUNT.js";
import INVENTORYPURCHASE from "../models/INVENTORYPURCHASE.js";
import INVENTORYDISTRIBUTION from "../models/INVENTORYDISTRIUTION.js";
import BRANCHINVENTORY from "../models/BRANCHINVENTORY.js";
import TRANSACTION from "../models/TRANSACTION.js";
import mongoose from "mongoose";

export const getAllInventoryTransaction = async (req, res, next) =>{
    try{
        const {mongoid, userType, pgcode} = req
        const {searchQuery, branch} = req.query
        const filter = {
            type: 'inventory_purchase',
            pgcode
        };

        if(userType === 'Account'){

            const account = await ACCOUNT.findById(mongoid)

            if(!account) return res.status(404).json({message:"Account manager is not found.",success:false})

            if(branch){
                if(!account.branch.includes(branch)) return res.status(403).json({message:"You have not access to get transaction of this branch.",success:false})

                filter.branch = branch
            }else{
                filter.branch = { $in: account.branch }
            }
        }else{
            if (branch) {
                filter.branch = branch
            }
        }

        let inventoryIds = [] 
        if(searchQuery){
            const inventoryDocs = await INVENTORYPURCHASE.find({
                item_name: { $regex:searchQuery, $options: 'i'}
            }).select('_id')

            inventoryIds = inventoryDocs.map(doc => doc._id)

            filter.refId = {$in : inventoryIds}
        }

        const transactions = await TRANSACTION.find(filter)
        .populate({
            path:'refId',
            model:'Inventorypurch'
        })
        .populate('branch')
        .sort({createdAt:-1})

        return res.status(200).json({message:"All transaction retrived successfully.",success:true,data:transactions})

    }catch(err){
        next(err)
    }
}

// Controller to add a new inventory purchase
export const addInventoryPurchase = async (req, res, next) => {
  try {
    const { pgcode, mongoid, userType } = req;
    const { item_name, item_type, quantity, unit, amount, branch, stored_in, bank_account, payment_mode } = req.body;

    // 1 Required fields check
    if (!item_name || !item_type || !quantity || !unit || !stored_in) {
      return res.status(400).json({
        message: "Please provide all required fields (item_name, item_type, quantity, unit, stored_in).",
        success: false
      });
    }

    if (stored_in === "direct_branch" && !branch) {
      return res.status(400).json({
        message: "For direct_branch purchase, branch is required.",
        success: false
      });
    }

    // 2` Validate branch if provided
    if (branch && !mongoose.Types.ObjectId.isValid(branch)) {
      return res.status(400).json({ message: "Invalid branch ID.", success: false });
    }

    // 3 Create Inventorypurch
    const purchase = new INVENTORYPURCHASE({
      item_name,
      item_type,
      quantity,
      remaining_quantity: quantity,
      unit,
      amount: amount || 0,
      branch: branch || null,
      pgcode,
      stored_in,
      distributed: false,
      added_by: mongoid
    });

    await purchase.save();

    // 4 If direct branch purchase → update BranchInventory
    if (stored_in === "direct_branch") {
      let branchStock = await BRANCHINVENTORY.findOne({ branch, item_name, unit, pgcode });
      if (!branchStock) {
        branchStock = new BRANCHINVENTORY({
          branch,
          pgcode,
          item_name,
          item_type,
          total_quantity: quantity,
          unit
        });
      } else {
        branchStock.total_quantity += quantity;
      }
      await branchStock.save();
    }

    // 5 Create Transaction if amount & bank_account provided
    if (amount && bank_account) {
      const transaction = new TRANSACTION({
        transactionType: "expense",
        type: "inventory_purchase",
        refModel: "Inventorypurch",
        refId: purchase._id,
        payment_mode: payment_mode || "cash",
        branch: branch || null,
        pgcode,
        bank_account
      });
      await transaction.save();
    }

    return res.status(201).json({
      message: "Inventory purchase added successfully.",
      success: true,
      data: purchase
    });

  } catch (err) {
    next(err);
  }
};


export const distributeInventory = async (req, res, next) => {
  try {
    const { pgcode, mongoid, userType } = req;
    const { purchaseId, branch, quantity } = req.body;

    // 1 Required field check
    if (!purchaseId || !branch || !quantity) {
      return res.status(400).json({
        message: "Please provide purchaseId, branch and quantity.",
        success: false
      });
    }

    if (!mongoose.Types.ObjectId.isValid(purchaseId) || !mongoose.Types.ObjectId.isValid(branch)) {
      return res.status(400).json({ message: "Invalid purchase or branch.", success: false });
    }

    // 2 Find purchase
    const purchase = await INVENTORYPURCHASE.findById(purchaseId);
    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found.", success: false });
    }

    if (purchase.stored_in !== "godown") {
      return res.status(400).json({ message: "Only godown items can be distributed.", success: false });
    }

    if (purchase.remaining_quantity < quantity) {
      return res.status(400).json({ message: "Not enough stock in purchase to distribute.", success: false });
    }

    // 3 Create InventoryDistribution record
    const distribution = new INVENTORYDISTRIBUTION({
      purchase: purchaseId,
      branch,
      quantity,
      unit: purchase.unit,
      pgcode,
      distributed_by: mongoid
    });
    await distribution.save();

    // 4 Update remaining_quantity in purchase
    purchase.remaining_quantity -= quantity;
    if (purchase.remaining_quantity === 0) {
      purchase.distributed = true;
    }
    await purchase.save();

    // 5 Update BranchInventory
    let branchStock = await BRANCHINVENTORY.findOne({ branch, item_name: purchase.item_name, unit: purchase.unit, pgcode });
    if (!branchStock) {
      branchStock = new BRANCHINVENTORY({
        branch,
        pgcode,
        item_name: purchase.item_name,
        item_type: purchase.item_type,
        total_quantity: quantity,
        unit: purchase.unit
      });
    } else {
      branchStock.total_quantity += quantity;
    }
    await branchStock.save();

    return res.status(201).json({
      message: "Inventory distributed successfully.",
      success: true,
      data: { distribution, updatedPurchase: purchase, branchStock }
    });

  } catch (err) {
    next(err);
  }
};

export const getAllInventoryPurchases = async (req, res, next) => {
  try {
    const { pgcode, userType, mongoid } = req;
    const filter = { pgcode };

    if (userType === 'Account') {
        const acmanager = await ACCOUNT.findById(mongoid)
        if (!acmanager) {
            return res.status(404).json({ message: "Account Manager Not Found.", success: false })
        }
        filter.branch = { $in: acmanager.branch }
    }


    // 1 Get all purchases for this pgcode
    const purchases = await INVENTORYPURCHASE.find(filter)
      .populate("branch", "branch_name") // If direct branch
      .lean();
    console.log(`[Inventory] Purchases fetched:`, purchases.length);

    // 2 Attach status and distribution summary
    const purchasesWithStatus = await Promise.all(
      purchases.map(async (purchase) => {
        let status = "";
        let distributions = [];

        if (purchase.stored_in === "direct_branch") {
          status = "Directly Assigned to Branch";
        } else if (purchase.stored_in === "godown") {
          if (purchase.distributed) {
            status = "Fully Distributed";
          } else {
            status = "Pending Distribution";
          }

          // Fetch distribution history for this purchase
          distributions = await INVENTORYDISTRIBUTION.find({
            purchase: purchase._id,
            pgcode
          })
            .populate("branch", "branch_name")
            .lean();
          console.log(`[Inventory] Distributions for purchase ${purchase._id}:`, distributions.length);
        }

        return {
          ...purchase,
          status,
          distributionsCount: distributions.length,
          distributions
        };
      })
    );
    console.log(`[Inventory] Purchases with status count:`, purchasesWithStatus.length);

    return res.status(200).json({
      message: "Purchases fetched successfully.",
      success: true,
      data: purchasesWithStatus
    });

  } catch (err) {
    next(err);
  }
};