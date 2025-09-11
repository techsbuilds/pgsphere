import BRANCH from "../models/BRANCH.js";
import CUSTOMER from "../models/CUSTOMER.js";
import ROOM from "../models/ROOM.js";
import TRANSACTION from "../models/TRANSACTION.js";
import { getMonthYearList, getPendingMonths } from "../helper.js";
import mongoose from "mongoose";

export const createCustomer = async (req, res, next) =>{
    try{
        const {mongoid, userType, pgcode} = req
        const {customer_name, mobile_no, deposite_amount, rent_amount, room, branch, joining_date} = req.body 
      
        if(!customer_name || !mobile_no || !deposite_amount || !rent_amount || !room || !branch || !joining_date) return res.status(400).json({message:"Please provide all required fields.",success:false})

        const existCustomer = await CUSTOMER.findOne({mobile_no})

        if(existCustomer) return res.status(409).json({message:"Customer is already exist same mobile no.",success:false})

        const existRoom = await ROOM.findById(room)

        if(!existRoom) return res.status(404).json({message:"Room not found.",success:false})

        const existBranch = await BRANCH.findById(branch)

        if(!existBranch) return res.status(404).json({message:"Branch is not found",success:false})

        if(existRoom.filled >= existRoom.capacity) return res.status(400).json({message:"Room is already full. Cannot add more customers.",success:false})

        const newCustomer = await CUSTOMER({
            customer_name,
            mobile_no,
            deposite_amount,
            rent_amount,
            room,
            joining_date,
            branch,
            pgcode,
            added_by:mongoid,
            added_by_type:userType
        })

        existRoom.filled = existRoom.filled + 1

        await existRoom.save()
        await newCustomer.save()

        return res.status(200).json({message:"New customer created successfully.",success:true,data:newCustomer})

    }catch(err){
        next(err)
    }
}

export const getAllCustomer = async (req, res, next) => {
    try {
      const { searchQuery, branch, room } = req.query;
      const { pgcode } = req
      const filter = { pgcode };
  
      if (searchQuery) {
        filter.customer_name = { $regex: searchQuery, $options: 'i' };
      }
  
      if (branch) {
        filter.branch = branch;
      }

      if (room) {
        filter.room = room
      }
  
      const customers = await CUSTOMER.find(filter)
        .populate('room')
        .populate('branch')
        .populate('added_by') 
        .sort({ createdAt: -1 }); 
  
      res.status(200).json({message:"All customer details retrived.",data:customers,success:true});
    } catch (err) {
      next(err);
    }
};

export const getCustomerByRoomId = async (req, res, next) =>{
    try{
        const { pgcode } = req;
        const {roomId} = req.params
        if(!roomId) return res.status(400).json({message:"Please provide room id.",success:false})
        const {searchQuery} = req.query

        const filter = { pgcode, room: roomId };
        if (searchQuery) filter.customer_name = { $regex: searchQuery, $options: "i" };

        const customers = await CUSTOMER.find(filter).sort({createdAt: -1});

        return res.status(200).json({message:"All customer details retrived by room id",success:true,data:customers})

    }catch(err){
        next(err)
    }
}

export const getCustomerByBranchId = async (req, res, next) =>{
    try{
       const {branchId} = req.params
       const { pgcode } = req;

       if(!branchId) return res.status(400).json({message:"Please provide branch id.",success:false})

       const {searchQuery} = req.query
       const filter = { pgcode, branch: branchId };
       if (searchQuery) filter.customer_name = { $regex: searchQuery, $options: "i" };

       const customers = await CUSTOMER.find(filter).sort({createdAt:-1});

       return res.status(200).json({message:"All customer details retrived by branch id.",success:true,data:customers})

    }catch(err){
        next(err)
    }
}

export const updateCustomerDetails = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { customerId } = req.params;
    const {
      customer_name,
      mobile_no,
      deposite_amount,
      rent_amount,
      room,
      branch,
      joining_date
    } = req.body;

    if (!customerId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Please provide customer id.", success: false });
    }

    const customer = await CUSTOMER.findById(customerId).session(session);
    if (!customer) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Customer not found.", success: false });
    }

    // ✅ Mobile number check
    if (mobile_no && mobile_no !== customer.mobile_no) {
      const existCustomer = await CUSTOMER.findOne({ mobile_no }).session(session);
      if (existCustomer) {
        await session.abortTransaction();
        session.endSession();
        return res.status(409).json({ message: "Customer already exists with same mobile no.", success: false });
      }
      customer.mobile_no = mobile_no;
    }

    if (customer_name) customer.customer_name = customer_name;
    if (deposite_amount) customer.deposite_amount = deposite_amount;
    if (rent_amount) customer.rent_amount = rent_amount;

    // ✅ Branch check
    if (branch) {
      const existBranch = await BRANCH.findById(branch).session(session);
      if (!existBranch || existBranch.pgcode !== req.pgcode) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: "Invalid branch for this PG", success: false });
      }
      customer.branch = branch;
    }

    // ✅ Room shift logic with transaction
    if (room && room.toString() !== customer.room?.toString()) {
      const oldRoomId = customer.room;
      const newRoomId = room;

      const oldRoom = oldRoomId ? await ROOM.findById(oldRoomId).session(session) : null;
      const newRoom = await ROOM.findById(newRoomId).session(session);

      if (!newRoom || newRoom.pgcode !== req.pgcode) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: "Invalid new room for this PG", success: false });
      }

      // Check capacity
      if (newRoom.filled >= newRoom.capacity) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: "New room is already full", success: false });
      }

      // Update filled counts
      if (oldRoom) {
        await ROOM.findByIdAndUpdate(oldRoom._id, { $inc: { filled: -1 } }, { session });
      }
      await ROOM.findByIdAndUpdate(newRoom._id, { $inc: { filled: 1 } }, { session });

      // Assign new room to customer
      customer.room = newRoomId;
    }

    if (joining_date) customer.joining_date = joining_date;

    await customer.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({ message: "Customer details updated successfully.", success: true });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};

export const changeStatus = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { pgcode } = req;
    const { customerId } = req.params;
    const { status } = req.body;

    if (!customerId || status === undefined) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Please provide customer id and status", success: false });
    }

    // normalize requested status to boolean
    const desiredStatus =
      typeof status === "string" ? status.toLowerCase() === "true" : Boolean(status);

    // ensure the customer belongs to this PG
    const customer = await CUSTOMER.findOne({ _id: customerId, pgcode }).session(session);
    if (!customer) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Customer not found.", success: false });
    }

    // if no change needed
    if (customer.status === desiredStatus) {
      await session.abortTransaction();
      session.endSession();
      return res.status(200).json({ message: "No change in status.", success: true, data: customer });
    }

    // ensure room belongs to same PG
    const room = await ROOM.findOne({ _id: customer.room, pgcode }).session(session);
    if (!room) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Customer room is missing or invalid.", success: false });
    }

    let updatedRoom;

    if (desiredStatus) {
      // ACTIVATE: false -> true
      if (room.filled >= room.capacity) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: "Room is full. Cannot activate customer.", success: false });
      }

      updatedRoom = await ROOM.findByIdAndUpdate(
        room._id,
        { $inc: { filled: 1 } },
        { new: true, session }
      );

      customer.status = true;
      await customer.save({ session });
    } else {
      // DEACTIVATE: true -> false
      if (room.filled > 0) {
        updatedRoom = await ROOM.findByIdAndUpdate(
          room._id,
          { $inc: { filled: -1 } },
          { new: true, session }
        );
      } else {
        // safeguard: shouldn't happen, but just in case
        updatedRoom = await ROOM.findByIdAndUpdate(
          room._id,
          { $set: { filled: 0 } },
          { new: true, session }
        );
      }

      customer.status = false;
      await customer.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: desiredStatus ? "Customer activated" : "Customer deactivated",
      success: true,
      data: { customer, room: updatedRoom },
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};
 
export const getPendingCustomerRentList = async (req, res, next) =>{
    try{
        const { pgcode } = req;
        const {searchQuery, branch} = req.query
        let filter = {
            pgcode,
            status:true
        }

        if(searchQuery){
            filter.customer_name = { $regex: searchQuery, $options: 'i' };
        }

        if(branch){
            filter.branch = branch
        }
        
        const customers = await CUSTOMER.find(filter)
        .populate('branch')
        .populate('room')

        const result = []
 
        for (const customer of customers){
           const monthList = getMonthYearList(customer.joining_date)

           const rentTransaction = await TRANSACTION.find({
             transactionType:'income',
             type:'customer_rent',
             refModel:'Customerrent',
             branch:customer.branch._id,
             pgcode,
           }).populate({
             path:'refId',
             model:'Customerrent',
             match: {customer:customer._id}
           })

           const paidRentMap = {}

           for (const tx of rentTransaction) {
               const entry = tx.refId;
               if(!entry) continue;

               const key = `${entry.month}-${entry.year}`;
               if(!paidRentMap[key]){
                paidRentMap[key] = 0
               }

               paidRentMap[key] += entry.amount;
           }

           const pendingRent = [];

           for(const {month, year} of monthList){
             const key = `${month}-${year}`
             const paid = paidRentMap[key] || 0
             const pending = Math.max(customer.rent_amount-paid, 0)

             if(pending > 0){
                const today = new Date();
                const currentMonth = today.getMonth() + 1;
                const currentYear = today.getFullYear()

                const isRequired = !(month === currentMonth && year === currentYear)

                pendingRent.push({
                    month,
                    year,
                    pending,
                    required: isRequired
                })
             }
          }

          if(pendingRent.length > 0) {
             result.push({
                customerId:customer._id,
                customer_name:customer.customer_name,
                branch:customer.branch,
                room:customer.room,
                mobile_no:customer.mobile_no,
                rent_amount:customer.rent_amount,
                pending_rent:pendingRent
             })
          }

        } 

        return res.status(200).json({message:"Pending customer list fetched successfully.",success:true,data:result})

    }catch(err){
        next(err)
    }
}