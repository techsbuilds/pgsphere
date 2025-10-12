import {z} from 'zod'

export const extraChargeSchema = z.object({
    name: z.
    string({invalid_type_error: "Extra charge name must be string."})
    .min(1,{message:"Extra charge name is required."}),

    amount: z.
    number({invalid_type_error: "Extra charge amount must be number."})
    .min(0,{message:"Extra charge amount cannot be negative."}),

    payment_mode: z.
    string()
    .min(1, {message:"Please select payment mode."}),

    bank_account: z.
    string()
    .min(1, {message:"Please select bank account."})
})