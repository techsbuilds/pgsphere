import ACCOUNT from "../models/ACCOUNT.js";
import LOGINMAPPING from "../models/LOGINMAPPING.js";
import bcryptjs from 'bcryptjs'
import CUSTOMER from "../models/CUSTOMER.js";
import EMPLOYEE from "../models/EMPLOYEE.js";

export const createAccountManager = async (req, res, next) => {
    try {
        const { mongoid, pgcode } = req

        let { full_name, contact_no, email, branch, password } = req.body

        if (!full_name || !contact_no || !email || !branch || !password) return res.status(200).json({ message: "Please provide all required fields.", success: false })
        
        // Ensure branch is always an array
        if (!Array.isArray(branch)) {
            branch = [branch];
        }

        const admin = await LOGINMAPPING.findOne({ mongoid: mongoid, userType: 'Admin' })

        if (!admin) return res.status(404).json({ message: "Admin not found.", success: false })

        const existAcContactNo = await ACCOUNT.findOne({ contact_no })

        if (existAcContactNo) return res.status(409).json({ message: "Account manager is already exist with same mobile no.", success: false })

        const existAcEmail = await LOGINMAPPING.findOne({ email })

        if (existAcEmail) return res.status(409).json({ message: "User is already exist with same email address.", success: false })

        const saltRounds = 10;
        const hashedPassword = await bcryptjs.hash(password, saltRounds);

        const newAcmanager = new ACCOUNT({
            full_name,
            contact_no,
            email,
            branch,
            added_by: mongoid
        })

        await newAcmanager.save()

        const newLoginMapping = new LOGINMAPPING({
            mongoid: newAcmanager._id,
            email,
            password: hashedPassword,
            userType: 'Account',
            pgcode,
            expiry: admin.expiry
        })

        await newLoginMapping.save()

        return res.status(200).json({ message: "New account manager created succcessfully.", success: true })

    } catch (err) {
        next(err)
    }
}


export const getAllAcmanager = async (req, res, next) => {
    try {
        const { pgcode } = req
        const { searchQuery = '', branch = '' } = req.query

        const mappings = await LOGINMAPPING.find({ userType: "Account", pgcode })
            .populate({
                path: 'mongoid',
                model: "Account",
                populate: [
                    {
                        path: 'branch',
                        model: 'Branch'
                    },
                    {
                        path: "added_by",
                        model: "Admin",
                        select: 'full_name email createdAt updatedAt'
                    }
                ]
            }).select('status mongoid')

        const filtered = mappings
            .filter((item) => {
                const nameMatch = item.mongoid?.full_name
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase());

                const branchMatch = branch
                    ? item.mongoid?.branch?._id?.toString() === branch
                    : true;

                return nameMatch && branchMatch;
            })
            .map((item) => {
                const account = item.mongoid?.toObject(); // Convert mongoose doc to plain object

                if (!account) return null;

                return {
                    ...account,
                    status: item.status,
                };
            })
            .filter(Boolean); // remove nulls

        return res.status(200).json({ message: "All acmanager retrived successfully.", success: true, data: filtered })

    } catch (err) {
        next(err)
    }
}


export const updateAcManager = async (req, res, next) => {
    try {
        //WIP: For add existing in only contact no and email validation
        const { pgcode } = req
        const { acmanagerId } = req.params

        if (!acmanagerId) return res.status(400).json({ message: "Please provide acmanager id.", success: false })

        const { full_name, contact_no, email, branch } = req.body

        const acmanager = await ACCOUNT.findById(acmanagerId)

        if (!acmanager) return res.status(404).json({ message: "Acmanager not found.", success: false })

        if (contact_no && acmanager.contact_no !== contact_no) {
            const existAcmanager = await ACCOUNT.findOne({ contact_no })

            if (existAcmanager) return res.status(409).json({ message: "Account mamanager is already exist same mobile no.", success: false })

            acmanager.contact_no = contact_no
        }

        if (email && acmanager.email !== email) {
            const existUser = await LOGINMAPPING.findOne({ email })

            if (existUser) return res.status(409).json({ message: "User is already exist with same mobileno.", success: false })

            acmanager.email = email
        }

        if (full_name) acmanager.full_name = full_name
        if (branch) acmanager.branch = branch

        await acmanager.save()

        return res.status(200).json({ message: "Acmanager details updated successfully.", success: true, data: acmanager })

    } catch (err) {
        next(err)
    }
}

export const changeAcmanagerStatus = async (req, res, next) => {
    try {
        const { acmanagerId } = req.params
        const { pgcode } = req

        const { status } = req.body

        if (!acmanagerId || status === undefined) return res.status(400).json({ message: "Please provide all required fields", success: false })

        const acmanager = await LOGINMAPPING.findOne({ mongoid: acmanagerId, pgcode, userType: 'Account' })

        if (!acmanager) return res.status(404).json({ message: "Acmanager not found.", success: false })

        acmanager.status = status

        await acmanager.save()

        return res.status(200).json({ message: "Acmanager status changed successfully.", success: true })

    } catch (err) {
        next(err)
    }
}

export const getDashboardSearchAcmanger = async (req, res, next) => {
    try {
        const { pgcode, mongoid } = req
        const { searchQuery } = req.query

        if (!searchQuery) return res.status(200).json({ message: "Please provide search query.", success: true, data: [] })

        const { role } = req.params
        let results = []

        const acmanager = await ACCOUNT.findById(mongoid)

        if (!acmanager) {
            return res.status(404).json({ message: "Acmanager not Found.", success: false })
        }

        let branches = acmanager.branch

        switch (role) {
            case 'Customers': {

                results = await CUSTOMER.find({
                    $or: [
                        { customer_name: { $regex: searchQuery, $options: 'i' } },
                        { mobile_no: { $regex: searchQuery, $options: 'i' } }
                    ],
                    pgcode,
                    branch: { $in: branches },
                    status: true
                }).populate('room').populate('branch')

            }
                break;

            case 'Employees': {

                results = await EMPLOYEE.find({
                    $or: [
                        { employee_name: { $regex: searchQuery, $options: 'i' } },
                        { mobile_no: { $regex: searchQuery, $options: 'i' } }
                    ],
                    pgcode,
                    branch: branches,
                    status: true
                }).populate('branch')

            }
                break;

            default: {
                return res.status(400).json({ message: "Invalid role.", success: false })
            }
        }
        return res.status(200).json({ message: "All Search query Results Retrived By Acmanager Successfully.", data: results, success: true })

    } catch (error) {
        next(error)
    }
}