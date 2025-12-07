import { z } from "zod";

export const customerSchema = z.object({
  customer_name: z
    .string()
    .min(1, { message: "Customer name is required." }),

  email: z
    .string()
    .min(1, { message: "Email is required." })
    .email({ message: "Enter a valid email address." }),

  mobile_no: z
    .string()
    .min(1, { message: "Mobile number is required." })
    .regex(/^[6-9]\d{9}$/, {
      message: "Enter a valid 10-digit Indian mobile number.",
    }),

  deposite_amount: z
    .number({ invalid_type_error: "Deposit amount must be a number." })
    .min(0, { message: "Minimum value is 0." }),

  variable_deposite_amount: z.
  number({invalid_type_error:'Variable deposit amount must be a number.'})
  .min(0,{message:'Minimum value is 0.'}),

  rent_amount: z
    .number({ invalid_type_error: "Rent amount must be a number." })
    .min(0, { message: "Minimum value is 0." }),

  payment_mode: z
    .string()
    .min(1, { message: "Please select payment mode." }),

  bank_account: z
    .string()
    .min(1, { message: "Please select bank account." }),

  room: z
    .string()
    .min(1, { message: "Please select any of one room." }),

  branch: z
    .string()
    .min(1, { message: "Please select branch." }),

  joining_date: z
    .date({ invalid_type_error: "Joining date is required." }),
  
  emergency_contact_name: z 
    .string() 
    .min(1, {message:"Emergency contact name is required."}),

  emergency_contact_mobile_no: z  
    .string()
    .min(1, { message: "Mobile number is required." })
    .regex(/^[6-9]\d{9}$/, {
      message: "Enter a valid 10-digit Indian mobile number.",
    }),

  ref_person_name: z.union([
    z.string().min(1, { message: "Reference name cannot be empty." }),
    z.literal(""),
  ]).optional(),

  ref_person_contact_no: z.union([
    z.string().regex(/^[6-9]\d{9}$/, {
      message: "Enter a valid 10-digit Indian mobile number.",
    }),
    z.literal(""),
  ]).optional(),
}) .refine(
  (data) => data.variable_deposite_amount <= data.deposite_amount,
  {
    message: "Pay deposit amount cannot be greater than fixed deposit amount.",
    path: ["variable_deposite_amount"], // highlights this field in UI errors
  }
);
