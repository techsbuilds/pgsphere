import INVENTORYPURCHASE from "../models/INVENTORYPURCHASE.js";
import TRANSACTION from "../models/TRANSACTION.js";
import ACCOUNT from "../models/ACCOUNT.js";

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
            model:'Inventorypurchase'
        })
        .populate('branch')
        .sort({createdAt:-1})

        return res.status(200).json({message:"All transaction retrived successfully.",success:true,data:transactions})

    }catch(err){
        next(err)
    }
}