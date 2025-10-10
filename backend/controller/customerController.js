import BRANCH from "../models/BRANCH.js";
import CUSTOMER from "../models/CUSTOMER.js";
import ROOM from "../models/ROOM.js";
import TRANSACTION from "../models/TRANSACTION.js";
import ACCOUNT from "../models/ACCOUNT.js";
import { removeFile } from "../utils/removeFile.js";
import mongoose from "mongoose";
import ExcelJS from "exceljs";
import path from "path";
import LOGINMAPPING from "../models/LOGINMAPPING.js";
import bcryptjs from "bcryptjs";
import ADMIN from "../models/ADMIN.js";
import { sendCustomerWelcomeEmail } from "../utils/sendMail.js";
import dotenv from "dotenv";
import CUSTOMERRENT from "../models/CUSTOMERRENT.js";
import DEPOSITEAMOUNT from "../models/DEPOSITEAMOUNT.js";

dotenv.config();

export const createCustomer = async (req, res, next) => {
  try {
    const { mongoid, userType, pgcode } = req;
    const {
      customer_name,
      email,
      ref_person_name,
      ref_person_contact_no,
      mobile_no,
      deposite_amount,
      rent_amount,
      room,
      branch,
      joining_date,
      payment_mode,
      bank_account,
    } = req.body;

    const adminLogin = await LOGINMAPPING.findOne({
      pgcode,
      userType: "Admin",
      status: "active",
    });
    if (!adminLogin) {
      if (req.file) {
        await removeFile(path.join("uploads", "aadhar", req.file.filename));
      }
      return res
        .status(400)
        .json({
          message: "Your PG is not active. Please contact support.",
          success: false,
        });
    }

    const admin = await ADMIN.findById(adminLogin.mongoid);
    if (!admin) {
      if (req.file) {
        await removeFile(path.join("uploads", "aadhar", req.file.filename));
      }
      return res
        .status(400)
        .json({
          message: "Your PG is not active. Please contact support.",
          success: false,
        });
    }

    if (!req.file)
      return res
        .status(400)
        .json({ message: "Please upload aadharcard image.", success: false });

    if (
      !customer_name ||
      !email ||
      !mobile_no ||
      !deposite_amount ||
      !rent_amount ||
      !room ||
      !branch ||
      !joining_date ||
      !bank_account ||
      !payment_mode
    ) {
      await removeFile(path.join("uploads", "aadhar", req.file.filename));
      return res
        .status(400)
        .json({
          message: "Please provide all required fields.",
          success: false,
        });
    }

    if (userType === "Account") {
      const account = await ACCOUNT.findById(mongoid);

      if (!account) {
        if (req.file) {
          await removeFile(path.join("uploads", "aadhar", req.file.filename));
        }
        return res
          .status(404)
          .json({ message: "Account manager is not found.", success: false });
      }


      if (!account.branch.includes(branch)) {
        if (req.file) {
          await removeFile(path.join("uploads", "aadhar", req.file.filename));
        }
        return res
          .status(403)
          .json({
            message: "You are not authorized to add customer in this branch.",
            success: false,
          });
      }

    }

    const existCustomer = await CUSTOMER.findOne({ mobile_no, email });

    if (existCustomer) {
      await removeFile(path.join("uploads", "aadhar", req.file.filename));
      return res
        .status(409)
        .json({
          message: "Customer is already exist with same email or mobile no.",
          success: false,
        });
    }

    const existRoom = await ROOM.findById(room);

    if (!existRoom) {
      await removeFile(path.join("uploads", "aadhar", req.file.filename));
      return res
        .status(404)
        .json({ message: "Room not found.", success: false });
    }

    const existBranch = await BRANCH.findById(branch);

    if (!existBranch) {
      await removeFile(path.join("uploads", "aadhar", req.file.filename));
      return res
        .status(404)
        .json({ message: "Branch is not found", success: false });
    }

    if (existRoom.branch.toString() !== branch) {
      await removeFile(path.join("uploads", "aadhar", req.file.filename));
      return res
        .status(400)
        .json({
          message: "Room does not belong to this branch.",
          success: false,
        });
    }

    if (existRoom.filled >= existRoom.capacity) {
      await removeFile(path.join("uploads", "aadhar", req.file.filename));
      return res
        .status(400)
        .json({
          message: "Room is already full. Cannot add more customers.",
          success: false,
        });
    }

    let imageUrl = `${process.env.DOMAIN}/uploads/aadhar/${req.file.filename}`;

    const saltRounds = 10;
    const hashedPassword = await bcryptjs.hash(pgcode, saltRounds);

    const newCustomer = await CUSTOMER({
      customer_name,
      mobile_no,
      deposite_amount,
      rent_amount,
      room,
      joining_date,
      branch,
      pgcode,
      ref_person_contact_no,
      ref_person_name,
      added_by: mongoid,
      added_by_type: userType,
      aadharcard_url: imageUrl
    });

    const newLogin = await LOGINMAPPING({
      mongoid: newCustomer._id,
      email,
      password: hashedPassword,
      userType: "Customer",
      pgcode,
      status: "active",
    });

    existRoom.filled = existRoom.filled + 1;

    //Create customer rent
    const newCustomerRent = await CUSTOMERRENT({
      customer: newCustomer._id,
      rent_amount,
      paid_amount: 0,
      status: "Pending",
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    });

    //Create deposite amount
    const newDepositeAmount = await DEPOSITEAMOUNT({
      customer: newCustomer._id,
      amount: deposite_amount,
    });

    //Create transaction for deposite amount
    const newTransaction = await TRANSACTION({
      transactionType: "income",
      type: "deposite",
      refModel: "Depositeamount",
      refId: newDepositeAmount._id,
      payment_mode: payment_mode,
      status: "completed",
      branch,
      pgcode,
      bank_account: bank_account,
      added_by: mongoid,
      added_by_type: userType
    });

    //Send mail to customer
    await sendCustomerWelcomeEmail(
      email,
      customer_name,
      admin.pgname,
      existBranch.branch_name,
      process.env.CUSTOMER_PORTAL_URL,
      pgcode
    );

    await newLogin.save();
    await existRoom.save();
    await newCustomer.save();
    await newCustomerRent.save();
    await newDepositeAmount.save();
    await newTransaction.save();

    return res
      .status(200)
      .json({
        message: "New customer created successfully.",
        success: true,
        data: newCustomer,
      });
  } catch (err) {
    next(err);
  }
};

export const getAllCustomer = async (req, res, next) => {
  try {
    const { searchQuery, branch, room } = req.query;
    const { pgcode, mongoid, userType } = req;

    // ✅ Step 1: account validation if userType is Account
    let branchFilter = null;
    if (userType === "Account") {
      const account = await ACCOUNT.findById(mongoid);
      if (!account) {
        return res
          .status(404)
          .json({ message: "Account manager not found.", success: false });
      }

      if (branch) {
        if (!account.branch.includes(branch)) {
          return res
            .status(403)
            .json({
              message:
                "You are not authorized to view customers in this branch.",
              success: false,
            });
        }
        branchFilter = mongoose.Types.ObjectId.createFromHexString(branch);
      } else {
        branchFilter = {
          $in: account.branch.map((id) =>
            mongoose.Types.ObjectId.createFromHexString(id.toString())
          ),
        };
      }
    } else {
      if (branch) {
        branchFilter = mongoose.Types.ObjectId.createFromHexString(branch);
      }
    }

    // ✅ Step 2: Build aggregation pipeline
    const pipeline = [
      {
        $lookup: {
          from: "loginmappings",
          localField: "_id",
          foreignField: "mongoid",
          as: "login",
        },
      },
      { $unwind: "$login" },
      {
        $match: {
          "login.pgcode": pgcode,
          "login.status": { $ne: "deleted" },
          "login.userType": "Customer",
        },
      },
      // ✅ Lookup for room
      {
        $lookup: {
          from: "rooms", // collection name for Room model
          localField: "room",
          foreignField: "_id",
          as: "room",
        },
      },
      { $unwind: "$room" },
      // ✅ Lookup for branch
      {
        $lookup: {
          from: "branches", // collection name for Branch model
          localField: "branch",
          foreignField: "_id",
          as: "branch",
        },
      },
      { $unwind: "$branch" },
    ];

    // ✅ Step 3: Apply optional filters
    if (searchQuery) {
      pipeline.push({
        $match: { customer_name: { $regex: searchQuery, $options: "i" } },
      });
    }

    if (room) {
      pipeline.push({
        $match: {
          "room._id": mongoose.Types.ObjectId.createFromHexString(room),
        },
      });
    }

    if (branchFilter) {
      pipeline.push({
        $match: { "branch._id": branchFilter },
      });
    }

    // ✅ Step 4: Sort and project fields
    pipeline.push(
      { $sort: { createdAt: -1 } },
      {
        $project: {
          customer_name: 1,
          email: 1,
          mobile_no: 1,
          deposite_amount: 1,
          rent_amount: 1,
          joining_date: 1,
          aadharcard_url: 1,
          ref_person_name: 1,
          ref_person_contact_no: 1,
          added_by: 1,
          added_by_type: 1,
          createdAt: 1,
          updatedAt: 1,
          status: "$login.status", // from loginmapping
          room: 1, // populated room object
          branch: 1, // populated branch object
        },
      }
    );

    // ✅ Step 5: Run aggregation
    const customers = await CUSTOMER.aggregate(pipeline);

    res.status(200).json({
      message: "All customer details retrieved.",
      data: customers,
      success: true,
    });
  } catch (err) {
    next(err);
  }
};

export const getCustomerByRoomId = async (req, res, next) => {
  try {
    const { pgcode, mongoid, userType } = req;

    const { roomId } = req.params;

    if (!roomId)
      return res
        .status(400)
        .json({ message: "Please provide room id.", success: false });

    const room = await ROOM.findById(roomId);

    if (!room)
      return res
        .status(404)
        .json({ message: "Room not found.", success: false });

    if (userType === "Account") {
      const account = await ACCOUNT.findById(mongoid);

      if (!account)
        return res
          .status(404)
          .json({ message: "Account manager not found.", success: false });

      if (!account.branch.includes(room.branch))
        return res
          .status(403)
          .json({
            message: "You are not authorized to view customers in this room.",
            success: false,
          });
    }

    const { searchQuery } = req.query;

    // const filter = { pgcode, room: roomId };
    // if (searchQuery) filter.customer_name = { $regex: searchQuery, $options: "i" };

    // const customers = await CUSTOMER.find(filter).sort({createdAt: -1});

    const customers = await CUSTOMER.aggregate([
      {
        $match: {
          pgcode,
          room: new mongoose.Types.ObjectId(roomId),
          ...(searchQuery
            ? { customer_name: { $regex: searchQuery, $options: "i" } }
            : {}),
        },
      },
      {
        $lookup: {
          from: "loginmappings",
          localField: "_id",
          foreignField: "mongoid",
          as: "loginDetails",
        },
      },
      {
        $unwind: "$loginDetails",
      },
      {
        $match: {
          "loginDetails.status": { $in: ["active", "inactive"] },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    return res
      .status(200)
      .json({
        message: "All customer details retrived by room id",
        success: true,
        data: customers,
      });
  } catch (err) {
    next(err);
  }
};

export const getCustomerByBranchId = async (req, res, next) => {
  try {
    const { branchId } = req.params;
    const { pgcode, mongoid, userType } = req;

    if (!branchId)
      return res
        .status(400)
        .json({ message: "Please provide branch id.", success: false });

    const branch = await BRANCH.findById(branchId);

    if (!branch)
      return res
        .status(404)
        .json({ message: "Branch not found.", success: false });

    if (userType === "Account") {
      const account = await ACCOUNT.findById(mongoid);

      if (!account)
        return res
          .status(404)
          .json({ message: "Account manager not found.", success: false });

      if (!account.branch.includes(branchId))
        return res
          .status(403)
          .json({
            message: "You are not authorized to view customers in this branch.",
            success: false,
          });
    }

    const { searchQuery } = req.query;

    // const filter = { pgcode, branch: branchId };

    // if (searchQuery) filter.customer_name = { $regex: searchQuery, $options: "i" };

    // const customers = await CUSTOMER.find(filter).sort({ createdAt: -1 });

    const customers = await CUSTOMER.aggregate([
      {
        $match: {
          pgcode,
          branch: new mongoose.Types.ObjectId(branchId),
          ...(searchQuery
            ? { customer_name: { $regex: searchQuery, $options: "i" } }
            : {}),
        },
      },
      {
        $lookup: {
          from: "loginmappings",
          localField: "_id",
          foreignField: "mongoid",
          as: "loginDetails",
        },
      },
      {
        $unwind: "$loginDetails",
      },
      {
        $match: {
          "loginDetails.status": { $in: ["active", "inactive"] },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    return res
      .status(200)
      .json({
        message: "All customer details retrived by branch id.",
        success: true,
        data: customers,
      });
  } catch (err) {
    next(err);
  }
};

export const updateCustomerDetails = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { customerId } = req.params;
    const { userType, mongoid, pgcode } = req;
    const {
      customer_name,
      mobile_no,
      deposite_amount,
      rent_amount,
      room,
      branch,
      joining_date,
    } = req.body;

    if (!customerId) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ message: "Please provide customer id.", success: false });
    }

    const customer = await CUSTOMER.findOne({ _id: customerId, pgcode })
      .populate({
        path: "loginDetails",
        model: "LOGINMAPPING",
        match: { status: { $in: ["active", "inactive"] } },
      })
      .session(session);

    if (!customer) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ message: "Customer not found.", success: false });
    }

    if (userType === "Account") {
      const account = await ACCOUNT.findById(mongoid);

      if (!account) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(404)
          .json({ message: "Account manager not found.", success: false });
      }

      if (!account.branch.includes(customer.branch.toString())) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(403)
          .json({
            message:
              "You are not authorized to update customer details in this branch.",
            success: false,
          });
      }
    }

    // ✅ Mobile number check
    if (mobile_no && mobile_no !== customer.mobile_no) {
      const existCustomer = await CUSTOMER.findOne({ mobile_no }).session(
        session
      );
      if (existCustomer) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(409)
          .json({
            message: "Customer already exists with same mobile no.",
            success: false,
          });
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
        return res
          .status(400)
          .json({ message: "Invalid branch for this PG", success: false });
      }
      customer.branch = branch;
    }

    // ✅ Room shift logic with transaction
    if (room && room.toString() !== customer.room?.toString()) {
      const oldRoomId = customer.room;
      const newRoomId = room;

      const oldRoom = oldRoomId
        ? await ROOM.findById(oldRoomId).session(session)
        : null;
      const newRoom = await ROOM.findById(newRoomId).session(session);

      if (!newRoom || newRoom.pgcode !== req.pgcode) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(400)
          .json({ message: "Invalid new room for this PG", success: false });
      }

      // Check capacity
      if (newRoom.filled >= newRoom.capacity) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(400)
          .json({ message: "New room is already full", success: false });
      }

      // Update filled counts
      if (oldRoom) {
        await ROOM.findByIdAndUpdate(
          oldRoom._id,
          { $inc: { filled: -1 } },
          { session }
        );
      }
      await ROOM.findByIdAndUpdate(
        newRoom._id,
        { $inc: { filled: 1 } },
        { session }
      );

      // Assign new room to customer
      customer.room = newRoomId;
    }

    if (joining_date) customer.joining_date = joining_date;

    await customer.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res
      .status(200)
      .json({
        message: "Customer details updated successfully.",
        success: true,
      });
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
    const { mongoid, userType } = req;

    if (!customerId || status === undefined) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({
          message: "Please provide customer id and status",
          success: false,
        });
    }

    // normalize requested status to boolean
    // const desiredStatus =
    //   typeof status === "string" ? status.toLowerCase() === "true" : Boolean(status);

    const desiredStatus = status;

    // ensure the customer belongs to this PG
    const customer = await CUSTOMER.findById(customerId).session(session);
    if (!customer) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ message: "Customer not found.", success: false });
    }

    if (userType === "Account") {
      const account = await ACCOUNT.findById(mongoid);

      if (!account) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(404)
          .json({ message: "Account manager not found.", success: false });
      }

      if (!account.branch.includes(customer.branch.toString())) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(403)
          .json({
            message:
              "You are not authorized to change customer status in this branch.",
            success: false,
          });
      }
    }

    // if no change needed
    // if (customer.status === desiredStatus) {
    //   await session.abortTransaction();
    //   session.endSession();
    //   return res.status(200).json({ message: "No change in status.", success: true, data: customer });
    // }

    // check customer in loginmapping
    const loginmapping = await LOGINMAPPING.findOne({
      mongoid: customerId,
    }).session(session);

    if (!loginmapping) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({
          message: "Customer not found in Loginmapping.",
          success: false,
        });
    }
    if (loginmapping.status === desiredStatus) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(200)
        .json({
          message: "No change in status.",
          success: true,
          data: customer,
        });
    }

    // ensure room belongs to same PG
    const room = await ROOM.findOne({ _id: customer.room, pgcode }).session(
      session
    );
    if (!room) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({
          message: "Customer room is missing or invalid.",
          success: false,
        });
    }

    let updatedRoom;

    if (desiredStatus === "active") {
      // ACTIVATE: false -> true
      if (room.filled >= room.capacity) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(400)
          .json({
            message: "Room is full. Cannot activate customer.",
            success: false,
          });
      }

      updatedRoom = await ROOM.findByIdAndUpdate(
        room._id,
        { $inc: { filled: 1 } },
        { new: true, session }
      );

      loginmapping.status = "active";
      await loginmapping.save({ session });
    }

    // for inactive customers
    if (desiredStatus === "inactive") {
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

      loginmapping.status = "inactive";
      await loginmapping.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message:
        desiredStatus === "active"
          ? "Customer activated"
          : "Customer deactivated",
      success: true,
      data: { customer, room: updatedRoom },
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};

export const getPendingCustomerRentList = async (req, res, next) => {
  try {
    const { pgcode, userType, mongoid } = req;
    const { searchQuery, branch } = req.query;
    let filter = {
      pgcode,
      status: true,
    };

    if (searchQuery) {
      filter.customer_name = { $regex: searchQuery, $options: "i" };
    }

    if (userType === "Account") {
      const account = await ACCOUNT.findById(mongoid);

      if (!account)
        return res
          .status(404)
          .json({ message: "Account manager not found.", success: false });

      if (branch) {
        if (!account.branch.includes(branch))
          return res
            .status(403)
            .json({
              message:
                "You are not authorized to view customers in this branch.",
              success: false,
            });
        filter.branch = branch;
      } else {
        filter.branch = { $in: account.branch };
      }
    } else {
      // For other user types, apply branch filter if provided
      if (branch) {
        filter.branch = branch;
      }
    }

    const customers = await CUSTOMER.find(filter)
      .populate("branch")
      .populate("room");

    const result = [];

    for (const customer of customers) {
      const pendingRents = await CUSTOMERRENT.find({ customer: customer._id, status: 'Pending' })

      const pendingRentMap = []

      for (const customerRent of pendingRents) {
        const isRequired = !(customerRent.month === (new Date().getMonth() + 1) && customerRent.year === new Date().getFullYear())
        pendingRentMap.push({
          month: customerRent.month,
          year: customerRent.year,
          pending: customerRent.rent_amount - customerRent.paid_amount,
          required: isRequired
        })
      }

      if (pendingRentMap.length > 0) {
        result.push({
          customerId: customer._id,
          customer_name: customer.customer_name,
          branch: customer.branch,
          room: customer.room,
          mobile_no: customer.mobile_no,
          rent_amount: customer.rent_amount,
          pending_rent: pendingRentMap
        })
      }

    }

    return res
      .status(200)
      .json({
        message: "Pending customer list fetched successfully.",
        success: true,
        data: result,
      });
  } catch (err) {
    next(err);
  }
};

export const exportCustomersToExcel = async (req, res, next) => {
  try {
    const { pgcode, mongoid, userType } = req;
    const { branch } = req.query;
    let filter = { pgcode };

    if (userType === "Account") {
      const account = await ACCOUNT.findById(mongoid);

      if (!account)
        return res
          .status(404)
          .json({ message: "Account manager not found.", success: false });

      if (branch) {
        if (!account.branch.includes(branch)) {
          return res
            .status(403)
            .json({
              message:
                "You are not authorized to view customers in this branch.",
              success: false,
            });
        }
        filter.branch = branch;
      } else {
        filter.branch = { $in: account.branch };
      }
    }

    // Admin gets all customers for the PG (no branch filter)
    // Account gets filtered by branch(s)

    const customers = await CUSTOMER.find(filter)
      .populate("branch", "branch_name")
      .populate("room", "room_id");

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Customers");

    worksheet.columns = [
      { header: "Customer Name", key: "customer_name", width: 25 },
      { header: "Mobile No", key: "mobile_no", width: 15 },
      { header: "Deposit Amount", key: "deposite_amount", width: 15 },
      { header: "Rent Amount", key: "rent_amount", width: 15 },
      { header: "Branch", key: "branch", width: 20 },
      { header: "Room", key: "room", width: 10 },
      { header: "Status", key: "status", width: 10 },
      { header: "Joining Date", key: "joining_date", width: 20 },
    ];

    customers.forEach((c) => {
      worksheet.addRow({
        customer_name: c.customer_name,
        mobile_no: c.mobile_no,
        deposite_amount: c.deposite_amount,
        rent_amount: c.rent_amount,
        branch: c.branch ? c.branch.branch_name : "-",
        room: c.room ? c.room.room_id : "-",
        status: c.status ? "Active" : "Inactive",
        joining_date: c.joining_date
          ? c.joining_date.toLocaleDateString()
          : "-",
      });
    });
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=customers.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
};

export const verifyCustomer = async (req, res, next) => {
  try {
    const { pgcode, mongoid, userType } = req;
    const { customerId } = req.params;
    const { deposite_amount, rent_amount, payment_mode, bank_account } =
      req.body;

    if (!customerId)
      return res
        .status(400)
        .json({ message: "Please provide customer id.", success: false });

    if (!deposite_amount || !rent_amount)
      return res
        .status(400)
        .json({
          message: "Please provide all required fields.",
          success: false,
        });

    const customer = await CUSTOMER.findById(customerId);

    if (!customer)
      return res
        .status(404)
        .json({ message: "Customer not found.", success: false });

    const customerLogin = await LOGINMAPPING.findOne({
      mongoid: customerId,
      pgcode,
    });

    if (!customerLogin)
      return res
        .status(404)
        .json({ message: "Customer not found.", success: false });

    customer.rent_amount = rent_amount;
    customer.deposite_amount = deposite_amount;

    customerLogin.status = "active";

    // Create customer rent
    const newCustomerRent = await CUSTOMERRENT({
      customer: customer._id,
      rent_amount,
      paid_amount: 0,
      status: "Pending",
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    });

    // Create new deposite amount
    const newDepositeAmount = await DEPOSITEAMOUNT({
      customer: customer._id,
      amount: deposite_amount,
    });

    // Create transaction for deposite amount
    const newTransaction = await TRANSACTION({
      transactionType: "income",
      type: "deposite",
      refModel: "Depositeamount",
      refId: newDepositeAmount._id,
      payment_mode: payment_mode,
      status: "completed",
      branch: customer.branch,
      pgcode,
      bank_account: bank_account,
      added_by: mongoid,
      added_by_type: userType
    });

    await customer.save();
    await customerLogin.save();
    await newCustomerRent.save();
    await newDepositeAmount.save();
    await newTransaction.save();

    return res
      .status(200)
      .json({ message: "Customer verified successfully.", success: true });
  } catch (err) {
    next(err);
  }
};

export const getCustomerDetailsForCustomer = async (req, res, next) => {
  try {

    const { userType, mongoid } = req

    if (userType !== 'Customer') {
      return res.status(403).json({ message: "You are not Autherized to access This Data.", success: false })
    }

    // find Customer
    const customer = await CUSTOMER.findById(mongoid)
      .populate('branch')
      .populate({
        path: 'room',
        populate: {
          path: 'floor_id'
        }
      }).lean()

    if (!customer) {
      return res.status(404).json({ message: "Customer Not Found.", success: false })
    }

    return res.status(200).json({ message: "Customer Data Recieved Successfully", data: customer, success: true })

  } catch (error) {
    next(error)
  }
}

export const updateCustomerByCustomer = async (req, res, next) => {

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let { name, email, mobile } = req.body
    const { userType, mongoid, pgcode } = req

    if (userType !== 'Customer') {

      await session.abortTransaction();
      session.endSession();

      return res.status(403).json({ message: "You are not Autherized to access This Data.", success: false })
    }

    let customer = await CUSTOMER.findById(mongoid).session(session)

    if (!customer) {

      await session.abortTransaction();
      session.endSession();

      return res.status(404).json({ message: "Customer Not Found.", success: false })
    }

    if (name) {

      const existCustomer = await CUSTOMER.findOne({ customer_name: name }).session(session)

      if (existCustomer) {

        await session.abortTransaction();
        session.endSession();

        return res.status(409).json({ message: "Customer already exists with same name.", success: false })
      }

      customer.customer_name = name
    }

    if (mobile) {
      const existCustomer = await CUSTOMER.findOne({ mobile_no: mobile }).session(session)

      if (existCustomer) {

        await session.abortTransaction();
        session.endSession();

        return res.status(409).json({ message: "Customer already exists with same mobile no.", success: false })
      }

      customer.mobile_no = mobile
    }

    if (email) {
      const existLogin = await LOGINMAPPING.findOne({ email, pgcode }).session(session)

      const customerLogin = await LOGINMAPPING.findOne({ mongoid, pgcode }).session(session)

      if (!customerLogin) {

        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: "Customer Login Details Not Found.", success: false })
      }

      if (existLogin) {
        await session.abortTransaction();
        session.endSession();
        return res.status(409).json({ message: "Customer already exists with same email.", success: false })
      }

      customerLogin.email = email
      await customerLogin.save({ session })
      customer.email = email
    }


    await customer.save({ session })

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({ message: "Customer Details Update Successfully by Customer.", success: true })

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error)
  }
}