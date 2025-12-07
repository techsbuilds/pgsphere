import multer from 'multer'
import path from 'path'
import fs from 'fs'

const branchUploadDir = path.join(process.cwd(), 'uploads', 'branch')
const pgLogoDir = path.join(process.cwd(), 'uploads', 'logo')
const profileDir = path.join(process.cwd(), 'uploads', 'profile')
const aadharcardDir = path.join(process.cwd(), 'uploads', 'aadhar')
const scannerDir = path.join(process.cwd(), 'uploads', 'scanner')
const paymentProofDir = path.join(process.cwd(), 'uploads', 'paymentproof')
const mealExcelDir = path.join(process.cwd(),'uploads','mealExcel')

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true)
    } else {
        cb(new Error('Only image file allowed!'))
    }
}

const excelFileFilter = (req, file, cb) => {
    const allowed = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "text/csv"
    ];

    if (allowed.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(new Error("Only Excel (.xlsx, .xls, .csv) files allowed!"))
    }
}


if (!fs.existsSync(branchUploadDir)) {
    fs.mkdirSync(branchUploadDir)
}

if (!fs.existsSync(pgLogoDir)) {
    fs.mkdirSync(pgLogoDir)
}

if(!fs.existsSync(profileDir)) {
    fs.mkdirSync(profileDir)
}

if (!fs.existsSync(aadharcardDir)) {
    fs.mkdirSync(aadharcardDir)
}

if (!fs.existsSync(scannerDir)) {
    fs.mkdirSync(scannerDir)
}

if(!fs.existsSync(paymentProofDir)){
    fs.mkdirSync(paymentProofDir)
}

if(!fs.existsSync(mealExcelDir)){
    fs.mkdirSync(mealExcelDir)
}

const branchStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, branchUploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSufix = Date.now() + '-' + Math.round(Math.random() + 1E9);
        const ext = path.extname(file.originalname)
        const name = file.fieldname + '-' + uniqueSufix + ext;
        cb(null, name)
    }
})

const logoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, pgLogoDir);
    },

    filename: (req, file, cb) => {
        const uniqueSufix = Date.now() + '-' + Math.round(Math.random() + 1E9);
        const ext = path.extname(file.originalname)
        const name = file.fieldname + '-' + uniqueSufix + ext;
        cb(null, name)
    }
})

const customerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        let dest = ''

        if(file.fieldname === 'profile'){
            dest = profileDir
        }else if(file.fieldname === 'aadharFront' || file.fieldname === 'aadharBack'){
            dest = aadharcardDir
        }else{
            return cb(new Error('Invalid field name'))
        }

        cb(null, dest)
    },

    filename: (req, file, cb) => {
        const uniqueSufix = Date.now() + '-' + Math.round(Math.random() + 1E9);
        const ext = path.extname(file.originalname)
        const name = file.fieldname + '-' + uniqueSufix + ext;
        cb(null, name)  
    }

})

const scannerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, scannerDir)
    },

    filename: (req, file, cb) => {
        const uniqueSufix = Date.now() + '-' + Math.round(Math.random() + 1E9);
        const ext = path.extname(file.originalname)
        const name = file.fieldname + '-' + uniqueSufix + ext;
        cb(null, name)
    }
})

const paymentProofStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, paymentProofDir)
    },
    
    filename: (req, file, cb) => {
        const uniqueSufix = Date.now() + '-' + Math.round(Math.random() + 1E9);
        const ext = path.extname(file.originalname)
        const name = file.fieldname + '-' + uniqueSufix + ext;
        cb(null, name)
    }
})

const mealExcelStorage = multer.diskStorage({

    destination:(req,file,cb) =>{
        cb(null,mealExcelDir)
    },

    filename:(req,file,cb) =>{
        const uniqeSufix = Date.now() + '-' + Math.round(Math.random() + 1E9)
        const ext = path.extname(file.originalname)
        const name ='meal-' + uniqeSufix + ext
        cb(null,name)
    }

})

export const uploadBranchImages = multer({
    storage: branchStorage,
    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 10
    },
    fileFilter
})


export const uploadLogoImages = multer({
    storage: logoStorage,
    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 10
    },
    fileFilter
})

export const uploadCustomerImages = multer({
    storage: customerStorage,
    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 10
    },
    fileFilter
})

export const uploadScannerImages = multer({
    storage: scannerStorage,
    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 1
    },
    fileFilter
})

export const uploadPaymentProofImages = multer({
    storage: paymentProofStorage,
    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 1
    },
    fileFilter
})

export const uploadMealExcelFiles = multer({
    storage : mealExcelStorage,
    limits:{ fileSize: 10 * 1024 * 1024 },
    fileFilter:excelFileFilter
})

export const branchMulter = uploadBranchImages.single('image')
export const logoMulter = uploadLogoImages.single('logo')
export const customerMulter = uploadCustomerImages.fields([{name:'aadharFront', maxCount:1}, {name:'aadharBack', maxCount:1}, {name: 'profile', maxCount: 1}])
export const scannerMulter = uploadScannerImages.single('scanner')
export const paymentProofMulter = uploadPaymentProofImages.single('payment_proof')
export const mealMulter = uploadMealExcelFiles.single('meal_excel')

