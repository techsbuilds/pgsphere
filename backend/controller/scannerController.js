import mongoose from "mongoose";
import ACCOUNT from "../models/ACCOUNT.js"
import ADMIN from "../models/ADMIN.js";
import SCANNER from "../models/SCANNER.js";
import { removeFile } from "../utils/removeFile.js";
import BRANCH from "../models/BRANCH.js";
import BANKACCOUNT from "../models/BANKACCOUNT.js";
import path from "path";
import fs from 'fs'
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const addScanner = async (req, res, next) => {
    try {
        let { bankaccount, branch } = req.body
        const { pgcode, mongoid, userType } = req

        if (!bankaccount || !branch) {

            if (req.file) {
                await removeFile(path.join("uploads", "scanner", req.file.filename));
            }

            return res.status(400).json({ message: "bsdsdv", success: false })
        }

        const bankAc = await BANKACCOUNT.findOne({ _id: bankaccount, pgcode })

        if (!bankAc) {
            if (req.file) {
                await removeFile(path.join("uploads", "scanner", req.file.filename));
            }

            return res.status(400).json({ message: "bank Account Not Found", success: false })
        }

        const isExist = await SCANNER.findOne({ bankaccount: bankAc })

        if (isExist) {
            return res.status(400).json({ message: "Scanner Exist in this Bank-Account.", success: false })
        }

        if (!Array.isArray(branch)) {
            branch = [branch]
        }

        const isExistBranch = await SCANNER.findOne({ branch: { $in: branch } })

        if (isExistBranch) {
            if (req.file) {
                await removeFile(path.join("uploads", "scanner", req.file.filename));
            }
            return res.status(400).json({ message: "Scanner Exist in this Branch.", success: false })
        }

        if (userType === "Account") {
            const acmanager = await ACCOUNT.findById(mongoid)

            if (!acmanager) {

                if (req.file) {
                    await removeFile(path.join("uploads", "scanner", req.file.filename));
                }

                return res.status(404).json({ message: "Acmaager Not Found.", success: false })
            }

            const isAuthorized = branch.every((br) => acmanager.branch.includes(br));

            if (!isAuthorized) {

                if (req.file) {
                    await removeFile(path.join("uploads", "scanner", req.file.filename));
                }

                return res.status(400).json({ message: "You are Not Autherized to Add Meals in this Branch!", success: false })
            }
        }

        const scannerurl = `${process.env.DOMAIN}/uploads/scanner/${req.file.filename}`

        const newScanner = new SCANNER({
            sc_image: scannerurl,
            bankaccount: bankaccount,
            pgcode,
            branch,
            added_by: mongoid,
            added_by_type: userType
        })

        await newScanner.save()

        return res.status(201).json({ message: "New Scanner Add Successfully.", success: true })

    } catch (error) {
        next(error)
    }
}

export const getallScanner = async (req, res, next) => {
    try {
        const { pgcode, mongoid, userType } = req

        const admin = await ADMIN.findById(mongoid)

        if (userType !== 'Admin') {
            return res.status(403).json({ message: "You are Not Autherized to Perform this task" })
        }

        if (!admin) {
            return res.status(404).json({ message: "Admin Not Found !", success: false })
        }

        const allScanners = await SCANNER.find({ pgcode }).populate('branch').populate('bankaccount').lean()


        return res.status(200).json({ message: "All Scanner Retrived Successfully by Admin", data: allScanners, success: true })

    } catch (error) {
        next(error)
    }
}

export const getScannerbyBranch = async (req, res, next) => {
    try {
        const { pgcode, mongoid, userType } = req
        const { branch } = req.query

        let filter = {}
        filter.pgcode = pgcode

        if (userType === "Account") {
            const acmanager = await ACCOUNT.findById(mongoid)

            if (!acmanager) {
                return res.status(404).json({ message: "Acmanager Not Found", success: false })
            }

            const branches = acmanager.branch

            if (branch) {
                if (!branches.includes(branch)) {
                    return res.status(403).json({ message: "You are not Autherized to access this Data.", success: false })
                }
                filter.branch = branch
            } else {
                filter.branch = { $in: branches }
            }

        } else {
            if (branch) {
                filter.branch = branch
            }
        }

        const scanner = await SCANNER.find(filter).populate('branch').populate('bankaccount').lean()

        return res.status(200).json({ message: "get Scanner by Branch Successfully", data: scanner, success: true })

    } catch (error) {
        next(error)
    }
}

export const updateScanner = async (req, res, next) => {
    const session = await mongoose.startSession()
    session.startTransaction()

    try {

        let { branch, bankaccount } = req.body
        const { scanner_id } = req.params
        const { mongoid, pgcode } = req
        const uploadedfile = req.file

        const uploadedFilePath = uploadedfile ? path.join("uploads", "scanner", uploadedfile.filename) : null

        const admin = await ADMIN.findById(mongoid).session(session)

        if (!admin) {

            if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
                await removeFile(uploadedFilePath);
            }

            await session.abortTransaction()
            session.endSession()
            return res.status(404).json({ message: "Admiin Not Found", success: false })
        }

        if (!scanner_id) {

            if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
                await removeFile(uploadedFilePath);
            }

            await session.abortTransaction()
            session.endSession()
            return res.status(400).json({ message: "Please Provide Branch", success: false })
        }

        let scanner = await SCANNER.findOne({ _id: scanner_id, pgcode }).session(session)

        if (!scanner) {

            if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
                await removeFile(uploadedFilePath);
            }

            await session.abortTransaction()
            session.endSession()
            return res.status(404).json({ message: "scanner Not Found", success: false })
        }

        if (uploadedfile) {
            if (scanner.sc_image) {
                const arr = scanner.sc_image.split("/");
                const fileName = arr[arr.length - 1];

                const oldPath = path.join("uploads", "scanner", fileName)
                const absolutePath = path.join(process.cwd(), oldPath)

                if (fs.existsSync(absolutePath)) {
                    console.log("remove file")
                    await removeFile(oldPath)
                }

            }
            scanner.sc_image = `${process.env.DOMAIN}/uploads/scanner/${uploadedfile.filename}`
        }

        if (branch) {

            console.log("branch", branch)
            console.log("old Branch : ", scanner.branch)

            if (!Array.isArray(branch)) {
                branch = [branch]
            }

            const branches = await BRANCH.find({ pgcode }).session(session)

            const branchids = branches.map((br) => br._id.toString())

            const isAuherized = branch.every((br) => branchids.includes(br.toString()))

            if (!isAuherized) {

                if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
                    await removeFile(uploadedFilePath);
                }

                await session.abortTransaction()
                session.endSession();

                return res.status(403).json({ message: "You Are Not Autherized to Update Scanner in This Branch", success: false })
            }

            const isExistBranch = await SCANNER.findOne({ _id: { $ne: scanner_id }, branch: { $in: branch } })

            if (isExistBranch) {
                if (req.file) {
                    await removeFile(path.join("uploads", "scanner", req.file.filename));
                }
                return res.status(400).json({ message: "Scanner Exist in this Branch.", success: false })
            }

            scanner.branch = branch;
        }

        if (bankaccount) {

            const bankAc = await BANKACCOUNT.findOne({ _id: bankaccount, pgcode }).session(session)

            if (!bankAc) {

                if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
                    await removeFile(uploadedFilePath);
                }

                await session.abortTransaction()
                session.endSession();

                return res.status(404).json({ message: "Bank Accound Not Found in this PG", success: false })
            }

            let isExist = await SCANNER.findOne({ bankaccount: bankAc._id, _id: { $ne: scanner._id } }).session(session)

            if (isExist) {
                if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
                    await removeFile(uploadedFilePath);
                }
                await session.abortTransaction()
                session.endSession();
                return res.status(400).json({ message: "Scanner Exist in this Bank-Account.", success: false })
            }

            scanner.bankaccount = bankaccount
        }

        await scanner.save({ session })

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({ message: "Update Scanner Successfully", success: true })

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error)
    }
}

export const updateStatusScanner = async (req, res, next) => {
    try {
        const { scanner_id } = req.params
        const { mongoid, pgcode } = req

        if (!scanner_id) {
            return res.status(400).json({ message: "Please Provide Scanner-id", success: false })
        }

        const admin = await ADMIN.findById(mongoid)

        if (!admin) {
            return res.status(403).json({ message: "Admin Not Found", success: false })
        }

        let scanner = await SCANNER.findOne({ _id: scanner_id, pgcode })

        if (!scanner) {
            return res.status(404).json({ message: "Scanner Not Found in this Branch", success: false })
        }

        const status = scanner.status

        if (status === "active") {
            scanner.status = "inactive"
        } else {
            scanner.status = "active"
        }

        await scanner.save()

        return res.status(200).json({ message: ` Status ${scanner.status} successfully.`, success: true })
    } catch (error) {
        next(error)
    }
}

export const deleteScanner = async (req, res, next) => {

    try {
        const { scanner_id } = req.params

        const scanner = await SCANNER.findById(scanner_id);
        if (!scanner) {
            return res.status(404).json({ message: "Scanner Not Found", success: false });
        }

        // Delete image file if exists
        if (scanner.sc_image) {
            const fileName = scanner.sc_image.split("/").pop();
            const absolutePath = path.join("uploads", "scanner", fileName);

            if (absolutePath && fs.existsSync(absolutePath)) {
                await removeFile(absolutePath);
            }
        }

        await SCANNER.findByIdAndDelete(scanner_id)

        return res.status(200).json({ message: "Scanner Deleted Successfully.", success: true })
    } catch (error) {
        next(error)
    }
}