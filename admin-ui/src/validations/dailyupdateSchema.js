import { z } from 'zod';

export const dailyupdateSchema = z.object({
  branch: z.array(z.string()).min(1, "At least one branch is required."),
  content_type: z.string().min(1, { message: "Please select update type." }),
  title: z.string().min(1, { message: "Message is required." }),

});
