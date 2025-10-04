import cron from 'node-cron';
import CUSTOMER from '../models/CUSTOMER.js';
import CUSTOMERRENT from '../models/CUSTOMERRENT.js';
import EMPLOYEE from '../models/EMPLOYEE.js';
import EMPLOYEESALARY from '../models/EMPLOYEESALARY.js';
import LOGINMAPPING from '../models/LOGINMAPPING.js';


const createMonthlyCustomerRentTask = async () => {
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    const customerLogin = await LOGINMAPPING.find({userType:'Customer', status:'active'}).select('mongoid');

     //For customers
     const customers = await CUSTOMER.find({_id:{$in:customerLogin.map(cust => cust.mongoid)}})

     const newRents = [];
 
     for(const cust of customers){
         const existingRent = await CUSTOMERRENT.findOne({customer:cust._id, month, year});
 
         if(!existingRent){
             newRents.push({
                 customer:cust._id,
                 rent_amount:cust.rent_amount,
                 paid_amount:0,
                 status:'Pending',
                 month,
                 year
             });
         }
     }
 
     if(newRents.length > 0){
         await CUSTOMERRENT.insertMany(newRents);
         console.log(`Created ${newRents.length} new customer rent records for ${month}/${year}`);
     } else {
         console.log("All customers already have rent records for this month.");
     }
}


cron.schedule('0 0 1 * *', async () => {
    await createMonthlyCustomerRentTask();
})