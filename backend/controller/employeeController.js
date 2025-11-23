import EMPLOYEE from "../models/EMPLOYEE.js";
import { getMonthYearList } from "../helper.js";
import TRANSACTION from "../models/TRANSACTION.js";
import ACCOUNT from "../models/ACCOUNT.js";
import mongoose from "mongoose";
import ExcelJS from "exceljs";
import EMPLOYEESALARY from "../models/EMPLOYEESALARY.js";

export const createEmployee = async (req, res, next) => {
  try {
    const { mongoid, userType, pgcode } = req
    const { employee_name, mobile_no, salary, employee_type, branch } = req.body


    // 1. Required fields check
    if (!employee_name || !mobile_no || !salary || !employee_type || !branch) {
      return res.status(400).json({ message: "Please provide all required fields.", success: false });
    }

    // 2. Validate branch
    if (!mongoose.Types.ObjectId.isValid(branch)) {
      return res.status(400).json({ message: "Invalid branch ID.", success: false });
    }

    // 3. Account manager authorization check
    if (userType === 'Account') {
      const acmanager = await ACCOUNT.findById(mongoid)

      if (!acmanager) {
        return res.status(404).json({ message: "Account Manager Not Fount.", success: false })
      }

      if (!acmanager.branch.includes(branch)) {
        return res.status(403).json({ message: "You are not Autherized to add employee in this branch.", success: false })
      }
    }

    const existEmployee = await EMPLOYEE.findOne({ mobile_no, branch })

    if (existEmployee) return res.status(409).json({ message: "Employee is already exist with same mobile no.", success: false })

    const newEmployee = new EMPLOYEE({
      employee_name,
      mobile_no,
      salary,
      employee_type,
      branch,
      pgcode,
      added_by: mongoid,
      added_by_type: userType
    })

    const newEmployeeSalary = new EMPLOYEESALARY({
      employee: newEmployee._id,
      salary,
      month: (new Date()).getMonth() + 1,
      year: (new Date()).getFullYear()
    })

    await newEmployeeSalary.save()

    await newEmployee.save()

    return res.status(200).json({ message: "New employee created successfully.", success: true })

  } catch (err) {
    next(err)
  }
}

export const getAllEmployee = async (req, res, next) => {
  try {
    const { searchQuery, branch } = req.query;
    const { userType, pgcode, mongoid } = req; // assuming you set this in middleware

    const filter = {};

    // Admin vs non-Admin filter
    if (userType === 'Account') {
      const acmanager = await ACCOUNT.findById(mongoid)

      if (!acmanager) {
        return res.status(404).json({ message: "Account manager not found.", success: false })
      }

      if (branch) {
        if (!acmanager.branch.includes(branch)) {
          return res.status(403).json({ message: "You are not Autherized to view Employee in this Branch.", success: false })
        }

        filter.branch = branch
      } else {
        filter.branch = { $in: acmanager.branch }
      }
    } else {
      if (branch) filter.branch = branch
    }

    filter.pgcode = pgcode;

    if (searchQuery) filter.employee_name = { $regex: searchQuery, $options: "i" };

    const employees = await EMPLOYEE.find(filter)
      .populate("branch")
      .populate("added_by")
      .sort({ createdAt: -1 });

    // Check if any employees exist
    if (employees.length === 0) {
      return res.status(200).json({
        message: searchQuery ? "No employees found matching your search criteria." : "No employees found.",
        success: false,
        data: [],
      });
    }

    return res.status(200).json({
      message: `${employees.length} employee(s) retrieved successfully.`,
      success: true,
      data: employees,
    });
  } catch (err) {
    next(err);
  }
};

export const updateEmployee = async (req, res, next) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const { employeeId } = req.params
    const { userType, mongoid } = req

    const { employee_name, salary, branch, mobile_no, employee_type } = req.body

    if (!employeeId) {
      await session.abortTransaction()
      session.endSession()
      return res.status(400).json({ message: "please provide employee id", success: false })
    }

    const employee = await EMPLOYEE.findById(employeeId).session(session)

    if (!employee) {
      await session.abortTransaction()
      session.endSession()
      return res.status(404).json({ message: "Employee not found.", success: false })
    }

    if (userType === 'Account') {
      const acmanager = await ACCOUNT.findById(mongoid).session(session)

      if (!acmanager) {
        await session.abortTransaction()
        session.endSession()
        return res.status(404).json({ message: "Account manager not found.", success: false })
      }

      if (!acmanager.branch.includes(employee.branch)) {
        await session.abortTransaction()
        session.endSession()
        return res.status(403).json({ message: "You are not Autherized to Update Employee in this Branch.", success: false })
      }
    }

    if (mobile_no && employee.mobile_no !== mobile_no) {
      const existEmployee = await EMPLOYEE.findOne({ mobile_no }).session(session)

      if (existEmployee) {
        await session.abortTransaction()
        session.endSession()
        return res.status(409).json({ message: "Employee already exists with the same mobile no.", success: false })
      }
    }

    if (employee_name) employee.employee_name = employee_name
    if (salary){
      if (salary < employee.salary) {
        await session.abortTransaction()
        session.endSession()
        return res.status(400).json({
          message: "Salary amount cannot be less than previous salary amount.",
          success: false,
        });
      }

      employee.salary = salary
      const employeeSalary = await EMPLOYEESALARY.findOne({
        employee: employee._id, 
        month: new Date().getMonth() + 1, 
        year: new Date().getFullYear()
      }).session(session)
      
      if(employeeSalary){
        employeeSalary.status = 'Pending'
        employeeSalary.salary = salary
        await employeeSalary.save({ session })
      }
    } 
    if (branch) employee.branch = branch
    if (mobile_no) employee.mobile_no = mobile_no
    if (employee_type) employee.employee_type = employee_type

    await employee.save({ session })

    await session.commitTransaction()
    session.endSession()

    return res.status(200).json({ message: "Employee details updated successfully.", success: true, data: employee })

  } catch (err) {
    await session.abortTransaction()
    session.endSession()
    next(err)
  }
}

export const changeEmployeeStatus = async (req, res, next) => {
  try {
    const { employeeId } = req.params

    const {mongoid, userType} = req

    const { status } = req.body
    
    if (!employeeId || status === undefined) return res.status(400).json({ message: "Please provide all required fields.", success: false })

    const employee = await EMPLOYEE.findById(employeeId)

    if (!employee) return res.status(400).json({ message: "Employee is not found.", success: false })

    if (userType === 'Account') {
      const acmanager = await ACCOUNT.findById(mongoid)

      if (!acmanager) {
        return res.status(404).json({ message: "Account manager not found.", success: false })
      }

      if (!acmanager.branch.includes(employee.branch)) {
        return res.status(403).json({ message: "You are not Autherized to Change Employee Status in this Branch.", success: false })
      }
    }

    employee.status = status

    await employee.save()

    return res.status(200).json({ message: "Employee status changed successfully.", success: true })

  } catch (err) {
    next(err)
  }
}

export const getEmployeePendingSalaries = async (req, res, next) => {
  try{
    const {searchQuery, branch} = req.query 

    const {mongoid, userType, pgcode} = req 

    let filter = {status: true}

    filter.pgcode = pgcode

    if (searchQuery) {
      filter.employee_name = { $regex: searchQuery, $options: 'i' };
    }

    if(userType === "Account"){
      const account = await ACCOUNT.findById(mongoid) 

      if(!account) return res.status(400).json({message:"Account manager not found.",success:false})

      if(branch) {
          if(!account.branch.includes(branch)) return res.status(403).json({message:"You have no access to get pending rents of requested branch.",success:false})

          filter.branch = branch
      }else{
          filter.branch = { $in: account.branch };
      }
    }else {
      if(branch){
          filter.branch = branch
      }
    }

    const employees = await EMPLOYEE.find(filter)
    .populate('branch')
    .sort({createdAt:-1})

    const result = [] 

    for (const employee of employees){
      const pendingSalary = await EMPLOYEESALARY.find({employee:employee._id, status:'Pending'})

      const pendingSalaryMap = [] 

      for(const employeeSalary of pendingSalary){
          const isRequired = !(employeeSalary.month === (new Date()).getMonth() + 1 && employeeSalary.year === (new Date()).getFullYear())
          pendingSalaryMap.push({
              month:employeeSalary.month,
              year:employeeSalary.year,
              pending: employeeSalary.salary - employeeSalary.paid_amount,
              required:isRequired
          })
      }

      if(pendingSalaryMap.length > 0){
          result.push({
              employeeId:employee._id,
              employee_name:employee.employee_name,
              employee_type:employee.employee_type,
              mobile_no:employee.mobile_no,
              salary:employee.salary,
              branch:employee.branch.branch_name,
              pending_salary:pendingSalaryMap
          })
      }
    }

    return res.status(200).json({message:"All pending salary details retrived successfully.",success:true,data:result})

  }catch(err){
    next(err)
  }
};

export const exportEmployeeToExcel = async (req, res, next) => {
  try {
    const { pgcode, mongoid, userType } = req;
    const { branch, searchQuery } = req.query;
    let filter = { pgcode };

    if (userType === "Account") {
      const account = await ACCOUNT.findById(mongoid);
      if (!account) return res.status(404).json({ message: "Account manager not found.", success: false });

      if (branch) {
        if (!account.branch.includes(branch)) {
          return res.status(403).json({ message: "You are not authorized to view employees in this branch.", success: false });
        }
        filter.branch = branch;
      } else {
        filter.branch = { $in: account.branch };
      }
    } else {
      if (branch) filter.branch = branch;
    }

    if (searchQuery) {
      filter.employee_name = { $regex: searchQuery, $options: "i" };
    }

    const employees = await EMPLOYEE.find(filter)
      .populate("branch", "branch_name")
      .populate("added_by", "email full_name")
      .sort({ createdAt: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Employees");

    worksheet.columns = [
      { header: "Employee Name", key: "employee_name", width: 25 },
      { header: "Mobile No", key: "mobile_no", width: 15 },
      { header: "Salary", key: "salary", width: 12 },
      { header: "Employee Type", key: "employee_type", width: 15 },
      { header: "Branch", key: "branch", width: 20 },
      { header: "Status", key: "status", width: 10 },
      { header: "Added By", key: "added_by", width: 25 },
    ];

    employees.forEach((e) => {
      worksheet.addRow({
        employee_name: e.employee_name,
        mobile_no: e.mobile_no,
        salary: e.salary,
        employee_type: e.employee_type,
        branch: e.branch ? e.branch.branch_name : "-",
        status: e.status ? "Active" : "Inactive",
        added_by: e.added_by?.full_name || "-"
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=employees.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
};