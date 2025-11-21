import {z} from 'zod' 

export const changeRoomSchema = z.object({
    room: z.string().min(1, {message:"Room is required."}),
    branch: z.string().min(1, {message:"Branch is required."}),
})