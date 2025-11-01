import {z} from "zod";

export const scannerSchema = z.object({
    bankaccount: z.string().min(1, {message: "Please select bank account."}),
    branch: z.string().min(1, {message: "Please select branch."}),
});