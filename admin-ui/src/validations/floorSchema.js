import {z} from 'zod';

export const floorSchema = z.object({   
    floor_name: z.string().min(1, 'Floor name is required'),
    branch: z.string().min(1, 'Branch ID is required'),
})