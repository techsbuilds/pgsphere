import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

//Importing routes
import authRoute from './routes/auth.js'
import branchRoute from './routes/branch.js'
import roomRoute from './routes/room.js'
import customerRoute from './routes/customer.js'
import employeeRoute from './routes/employee.js'
import acmanagerRoute from './routes/account.js'
import transactionRoute from './routes/transaction.js'
import inventoryRoute from './routes/inventory.js'
import monthlyRoute from './routes/monthly.js'
import bankaccountRoute from './routes/bankaccount.js'
import cashoutRoute from './routes/cashout.js'
import adminRoute from './routes/admin.js'
import contactRoute from './routes/contact.js'
import dailyUpdateRoute from './routes/dailyupdate.js'
import floorRoute from './routes/floor.js'
import mealRoute from './routes/meal.js'
import complaintRoute from './routes/compliant.js'
import scannerRoute from './routes/scanner.js'
import mealconfigRoute from './routes/mealconfig.js'

// Get the current file's path
const __filename = fileURLToPath(import.meta.url);

// Get the current directory's path
const __dirname = path.dirname(__filename);

// App configuration
dotenv.config();

// App configuration
const port = process.env.PORT || 8020;

const app = express();


if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', true);
}

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const corsOptions = {
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "https://app.pgsphere.com",
        "http://app.pgsphere.com",
        "https://pgsphere.com",
        "http://pgsphere.com",
      ];
      // Allow requests with no origin (like mobile apps or CURL)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
    credentials: true,
};

// Handle preflight requests for all routes
app.options('*', cors(corsOptions));

// Middleware for using CORS
app.use(cors(corsOptions));


// Middleware to parse JSON
app.use(express.json({limit:"50mb"}));

// Middleware to read cookies data
app.use(cookieParser());
app.use(express.urlencoded({limit:"50mb", extended: true }));


const connectDb = async () => {
    try {
      await mongoose.connect(process.env.MONGO);
      console.log("Connected to MongoDB successfully");
    } catch (err) {
      throw err;
    }
  };
  
  app.get("/", (req, res) => {
    res.send("Bahut maza aa raha hai 🥳");
  });
  
  
  // Notify MongoDB connection status
  mongoose.connection.on("connected", () => {
    console.log("MongoDB connected successfully");
  });
  
  mongoose.connection.on("disconnected", () => {
    console.log("MongoDB disconnected");
  });

  
//Middleware
app.use('/api/auth',authRoute)
app.use('/api/branch',branchRoute)
app.use('/api/room',roomRoute)
app.use('/api/customer',customerRoute)
app.use('/api/employee',employeeRoute)
app.use('/api/acmanager',acmanagerRoute)
app.use('/api/transaction', transactionRoute)
app.use('/api/inventory',inventoryRoute)
app.use('/api/monthlybill', monthlyRoute)
app.use('/api/bankaccount', bankaccountRoute)
app.use('/api/cashout', cashoutRoute)
app.use('/api/admin', adminRoute)
app.use('/api/contact',contactRoute)
app.use('/api/dailyupdate', dailyUpdateRoute)
app.use('/api/floor', floorRoute)
app.use('/api/meal',mealRoute)
app.use('/api/complaint',complaintRoute)
app.use('/api/scanner',scannerRoute)
app.use('/api/mealconfig',mealconfigRoute)

 // Middleware to catch errors
 app.use((err, req, res, next) => {
    const errStatus = err.status || 500;
    const errMsg = err.message || "Something went wrong!";
  
    return res.status(errStatus).json({
      success: "false",
      status: errStatus,
      message: errMsg,
      stack: err.stack,
    });
  });
  
  app.listen(port, () => {
    connectDb();
    console.log(`App is listening on port: ${port}`);
 });