import {z} from 'zod'

export const payRentSchema = z.object({
    amount: z.
    number({invalid_type_error: "Rent amount must be number."}),

    isDeposite: z.
    boolean({invalid_type_error: "isDeposite must be boolean."})
    .default(false),

    isSettled: z.
    boolean({invalid_type_error: "isSettled must be boolean."})
    .default(false),

    payment_mode: z.
    string(),

    bank_account: z.
    string()
})
.refine(
    (data) =>
      data.isDeposite || (!!data.payment_mode && !!data.bank_account && !!data.amount),
    {
      message: "payment mode, bank account, and amount are required.",
      path: ["general_error"], // 👈 you can point to one field or leave blank
    }
  );