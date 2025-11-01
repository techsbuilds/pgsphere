import {z} from 'zod'

export const verifyCustomerSchema = z.object({
    rent_amount: z.
    number({invalid_type_error: "Rent amount must be number."})
    .min(1, { message: 'Minimum value is 0.'}),

    deposite_amount: z.
    number({invalid_type_error: "Deposite amount must be number."})
    .min(1, { message: 'Minimum value is 0.'}),

    payment_mode: z.
    string()
    .min(1, {message:"Please select payment mode."}),

    bank_account: z.
    string()
    .min(1, {message:"Please select bank account."})
})