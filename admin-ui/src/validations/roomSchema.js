import { z } from 'zod';

export const roomSchema = z.object({
  room_id: z.string().min(1, { message: 'Room no is required.' }),

  capacity: z
    .number({
      required_error: 'Capacity is required.',
      invalid_type_error: 'Capacity must be a number.',
    })
    .min(1, { message: 'Minimum value is 1.' }),

  remark: z.string().optional(),

  room_type: z.enum(['Hall', 'Room'], {
    required_error: 'Room type is required.',
    invalid_type_error: 'Invalid room type.',
  }),

  service_type: z.enum(['AC', 'Non-AC'], {
    required_error: 'Service type is required.',
    invalid_type_error: 'Invalid service type.',
  }),
});
