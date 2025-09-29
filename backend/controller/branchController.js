import BRANCH from "../models/BRANCH.js";
import dotenv from "dotenv";
import path from "path";
import { removeFile } from "../utils/removeFile.js";
import ROOM from "../models/ROOM.js";
import CUSTOMER from "../models/CUSTOMER.js";
import EMPLOYEE from "../models/EMPLOYEE.js";
import mongoose from "mongoose";
import ACCOUNT from "../models/ACCOUNT.js";
import LOGINMAPPING from "../models/LOGINMAPPING.js";
dotenv.config();

/* Create Branch */
export const createBranch = async (req, res, next) => {
  try {
    const { mongoid, pgcode } = req; // from auth middleware
    const { branch_name, branch_address } = req.body;

    const admin = await LOGINMAPPING.findOne({mongoid, pgcode})

    const branchCount = await BRANCH.countDocuments({pgcode})

    if (branchCount >= admin.plan.branchCount){
      if (req.file) {
        await removeFile(path.join("uploads", "branch", req.file.filename));
      }
      return res.status(403).json({message:"You reached your plan limit. Please upgrade your plan.", success:false})
    }

    if (!branch_name || !branch_address) {
      if (req.file) {
        await removeFile(path.join("uploads", "branch", req.file.filename));
      }
      return res
        .status(400)
        .json({ message: "Please provide required fields.", success: false });
    }

    const existing = await BRANCH.findOne({ branch_name, pgcode });

    if (existing) {
      if (req.file) await removeFile(path.join("uploads", "branch", req.file.filename));
      return res.status(400).json({
        message: "Branch name already exists.",
        success: false,
      });
    }

    let imageUrl = null;
    if (req.file) {
      imageUrl = `${process.env.DOMAIN}/uploads/branch/${req.file.filename}`;
    }

    const newBranch = new BRANCH({
      branch_name,
      branch_address,
      branch_image: imageUrl,
      added_by: mongoid,
      pgcode,
    });

    await newBranch.save();

    return res.status(201).json({
      message: "New branch created successfully",
      success: true,
      data: newBranch,
    });
  } catch (err) {
    if (req.file) {
      await removeFile(path.join("uploads", "branch", req.file.filename));
    }
    next(err);
  }
};

/* Get All Branches */
export const getAllBranch = async (req, res, next) => {
  try {
    const { pgcode, userType, mongoid } = req;
    const { searchQuery } = req.query;
    let query = { pgcode };

    if (userType === 'Account') {

      const acmanager = await ACCOUNT.findById(mongoid)

      if (!acmanager) {
        return res.status(404).json({ message: "Account Manager Not Found.", success: false })
      }

      query._id = { $in: acmanager.branch }
    }

    if (searchQuery) {
      query.$or = [
        { branch_name: { $regex: searchQuery, $options: "i" } },
        { branch_address: { $regex: searchQuery, $options: "i" } }
      ];

    }

    const branch = await BRANCH.find(query).sort({ createdAt: -1 });

    return res
      .status(200)
      .json({
        message: "All Branches retrived successfully.",
        success: true,
        data: branch,
      });

  } catch (err) {
    next(err);
  }
};

/* Update Branch */
export const updateBranch = async (req, res, next) => {
  try {
    const { pgcode } = req;
    const { branchId } = req.params;
    const { branch_name, branch_address, remove_image } = req.body || {};
    const uploadedFile = req.file;

    if (!mongoose.Types.ObjectId.isValid(branchId)) {
      return res.status(400).json({ message: "Invalid branch ID.", success: false });
    }

    if (!branchId)
      return res
        .status(400)
        .json({ message: "Please provide branch id.", success: false });

    const branch = await BRANCH.findOne({ _id: branchId, pgcode });
    if (!branch)
      return res
        .status(404)
        .json({ message: "Branch not found or unauthorized.", success: false });

    if (uploadedFile) {
      if (branch.branch_image) {
        const arr = branch.branch_image.split("/");
        const fileName = arr[arr.length - 1];
        removeFile(path.join("uploads", "branch", fileName));
      }
      branch.branch_image = `${process.env.DOMAIN}/uploads/branch/${uploadedFile.filename}`;
    }

    if (remove_image && branch.branch_image) {
      const arr = branch.branch_image.split("/");
      const fileName = arr[arr.length - 1];
      await removeFile(path.join("uploads", "branch", fileName));
      branch.branch_image = null;
    }

    if (branch_name) branch.branch_name = branch_name;
    if (branch_address) branch.branch_address = branch_address;

    await branch.save();

    return res
      .status(200)
      .json({ message: "Branch Updates Saved Successfully.", success: true });
  } catch (err) {
    next(err);
  }
};

/* Get Branch By ID */
export const getBranchById = async (req, res, next) => {
  try {
    const { pgcode, userType, mongoid } = req;
    const { branchId } = req.params;

    if (userType === 'Account') {
      const acmanager = await ACCOUNT.findOne({ _id: mongoid })
      if (!acmanager) {
        return res.status(404).json({ message: "Account Manager Not Found.", success: false })
      }

      if (!acmanager.branch.includes(branchId)) {
        return res.status(403).json({ message: "You are not Autherized to access this Branch.", success: false })
      }
    }

    if (!branchId)
      return res
        .status(400)
        .json({ message: "Please provide branch id.", success: false });

    if (!mongoose.Types.ObjectId.isValid(branchId)) {
      return res.status(400).json({ message: "Invalid branch ID.", success: false });
    }

    const branch = await BRANCH.findOne({ _id: branchId, pgcode });
    if (!branch)
      return res
        .status(404)
        .json({ message: "Branch not found or unauthorized.", success: false });

    return res.status(200).json({
      message: "Branch details retrieved successfully.",
      success: true,
      data: branch,
    });
  } catch (err) {
    next(err);
  }
};

/* Dashboard Summary */
export const getDashboardSummery = async (req, res, next) => {
  try {
    const { pgcode, userType, mongoid } = req;
    const { branchId } = req.params;

    if (userType === 'Account') {
      const acmanager = await ACCOUNT.findOne({ _id: mongoid })
      if (!acmanager) {
        return res.status(404).json({ message: "Account Manager Not Found.", success: false })
      }

      if (!acmanager.branch.includes(branchId)) {
        return res.status(403).json({ message: "You are not Autherized to access this Branch-Data.", success: false })
      }
    }

    if (!branchId)
      return res
        .status(400)
        .json({ message: "Please provide branch id.", success: false });

    const branch = await BRANCH.findOne({ _id: branchId, pgcode });
    if (!branch)
      return res
        .status(404)
        .json({ message: "Branch not found or unauthorized.", success: false });

    const totalRooms = await ROOM.countDocuments({ branch: branchId });
    const totalCustomers = await CUSTOMER.countDocuments({
      branch: branchId,
      status: true,
    });
    const totalEmployees = await EMPLOYEE.countDocuments({
      branch: branchId,
      status: true,
    });

    return res.status(200).json({
      message: "Dashboard summary retrieved for branch.",
      data: { totalRooms, totalCustomers, totalEmployees },
      success: true,
    });
  } catch (err) {
    next(err);
  }
};