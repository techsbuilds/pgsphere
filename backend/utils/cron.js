import cron from 'node-cron';
import CUSTOMER from '../models/CUSTOMER.js';
import CUSTOMERRENT from '../models/CUSTOMERRENT.js';
import EMPLOYEE from '../models/EMPLOYEE.js';
import EMPLOYEESALARY from '../models/EMPLOYEESALARY.js';
import LOGINMAPPING from '../models/LOGINMAPPING.js';
import CRONLOGS from '../models/CRONLOGS.js';


const createMonthlyCustomerRentTask = async (month, year) => {
    try{
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

     let status = "Success";
     let count = 0;
 
 
     if(newRents.length > 0){
         await CUSTOMERRENT.insertMany(newRents);
         count = newRents.length;
         console.log(`Created ${newRents.length} new customer rent records for ${month}/${year}`);
     } else {
         console.log("All customers already have rent records for this month.");
     }

     //Log result in cron job
     await CRONLOGS.create({
        task:'Customer Rent Generation',
        month,
        year,
        status,
        count
     })
    }catch(err){
        console.error(`❌ Error creating rent for ${month}/${year}:`, err.message);

        await CRONLOGS.create({
            task:'Customer Rent Generation',
            month,
            year,
            status:'Failed',
            count:0
         })
    }
}


const checkAndRecoverMissedCrons = async () =>{
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    const lastLog = await CRONLOGS.findOne({task:'Customer Rent Generation', status:'Success'}).sort({year:-1, month:-1});
    let startMonth, startYear;

    if(lastLog){
      startMonth = lastLog.month;
      startYear = lastLog.year; 
    }else{
      startMonth = currentMonth - 1;
      startYear = currentYear;  
    }

    const missedMonths = [] 
    let y = startYear;
    let m = startMonth;

    while (y < currentYear || (y === currentYear && m < currentMonth)) {
        m++;
        if (m > 12) {
            m = 1;
            y++;
        }
        missedMonths.push({month: m, year: y});
    }

    for(const {month, year } of missedMonths){
        const existLog = await CRONLOGS.findOne({task:'Customer Rent Generation', month, year, status:'Success'});

        if(!existLog){
            console.log(`🔄 Recovering missed cron for ${month}/${year}`);
            await createMonthlyCustomerRentTask(month, year);
        } else{
            console.log(`✅ Cron already completed for ${month}/${year}`);
        }
    }

}

cron.schedule('0 0 1 * *', async () => {
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    await createMonthlyCustomerRentTask(month, year);
})


export const initCronsJobs = async () =>{
    await checkAndRecoverMissedCrons();
}