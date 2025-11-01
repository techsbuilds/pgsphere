import multer from 'multer'
import path from 'path'
import fs from 'fs'

const branchUploadDir = path.join(process.cwd(), 'uploads', 'branch')
const pgLogoDir = path.join(process.cwd(), 'uploads', 'logo')
const aadharcardDir = path.join(process.cwd(), 'uploads', 'aadhar')
const scannerDir = path.join(process.cwd(), 'uploads', 'scanner')
const paymentProofDir = path.join(process.cwd(), 'uploads', 'paymentproof')

if (!fs.existsSync(branchUploadDir)) {
    fs.mkdirSync(branchUploadDir)
}

if (!fs.existsSync(pgLogoDir)) {
    fs.mkdirSync(pgLogoDir)
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

const aadharCardStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, aadharcardDir)
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

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true)
    } else {
        cb(new Error('Only image file allowed!'))
    }
}


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

export const uploadAadharCardImages = multer({
    storage: aadharCardStorage,
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

export const branchMulter = uploadBranchImages.single('image')
export const logoMulter = uploadLogoImages.single('logo')
export const aadharCardMulter = uploadAadharCardImages.single('aadharcard')
export const scannerMulter = uploadScannerImages.single('scanner')
export const paymentProofMulter = uploadPaymentProofImages.single('payment_proof')
