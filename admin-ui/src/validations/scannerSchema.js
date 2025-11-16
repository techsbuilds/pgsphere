import {z} from "zod";

export const scannerSchema = z.object({
    bankaccount: z.string().min(1, {message: "Please select bank account."}),
    branch: z.array(z.string()).min(1, "At least one branch is required."),
});