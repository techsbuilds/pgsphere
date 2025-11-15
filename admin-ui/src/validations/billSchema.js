import {z} from 'zod'

export const billSchema = z.object({
    payment_name:z
    .string()
    .min(1, {message:"Monthly bill name is required."}),

    notes:z
    .string()
    .optional(),

    branch: z
    .string() 
    .min(1, {message:"Branch name is required."}),

    starting_date: z
    .date({invalid_type_error:"Starting date is required"})

})