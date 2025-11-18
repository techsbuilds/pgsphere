import {z} from 'zod'

export const verifyCustomerSchema = z.object({
    rent_amount: z.
    number({invalid_type_error: "Rent amount must be number."})
    .min(1, { message: 'Minimum value is 0.'}),

    deposite_amount: z.
    number({invalid_type_error: "Deposite amount must be number."})
    .min(1, { message: 'Minimum value is 0.'}),

    variable_deposite_amount: z.
    number({invalid_type_error:'Variable deposit amount must be a number.'})
    .min(0,{message:'Minimum value is 0.'}),

    payment_mode: z.
    string()
    .min(1, {message:"Please select payment mode."}),

    bank_account: z.
    string()
    .min(1, {message:"Please select bank account."})
}).refine(
    (data) => data.variable_deposite_amount <= data.deposite_amount,
    {
      message: "Pay deposit amount cannot be greater than fixed deposit amount.",
      path: ["variable_deposite_amount"], // highlights this field in UI errors
    }
  );
  