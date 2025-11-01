import Floor from "../models/Floor.js";
import ACCOUNT from "../models/ACCOUNT.js";
import ROOM from "../models/ROOM.js";

export const createFloor = async (req, res, next) => {
    try {
        const { mongoid, userType, pgcode } = req

        const { floor_name, branch } = req.body

        if (!floor_name || !branch)  return res.status(400).json({ message: "Please provide all required fields.", success: false })

        if (userType === 'Account') {
            const acmanager = await ACCOUNT.findById(mongoid)

            if (!acmanager) {
                return res.status(404).json({ message: "Account manager not Found.", success: false })
            }
            if (!acmanager.branch.includes(branch)) {
                return res.status(403).json({ message: "You are not Autherized to create Floor in this Branch.", success: false })
            }
        }
        const existFloor = await Floor.findOne({ floor_name, branch, pgcode })

        if (existFloor) return res.status(409).json({ message: "Floor with this name already exists in this branch.", success: false })
        const newFloor = await Floor({
            floor_name,
            branch,
            pgcode
        })
        await newFloor.save()

        return res.status(201).json({ message: "New floor created successfully.", success: true, data: newFloor })
    } catch (err) {
        next(err)
    }
}

export const getFloorAndRoomByBranch = async (req, res, next) => {
    try{
        const {branchId} = req.params  
        const {mongoid, userType, pgcode} = req 

        if(!branchId) return res.status(400).json({message:"Please provide all required fields.", success:false})

        if(userType === 'Account'){
            const acmanager = await ACCOUNT.findById(mongoid) 
            if(!acmanager){
                return res.status(404).json({message:"Account manager not Found.", success:false})
            }
            if(!acmanager.branch.includes(branchId)){
                return res.status(403).json({message:"You are not Autherized to view Floor in this Branch.", success:false})
            }
        }

        const floors = await Floor.find({branch:branchId, pgcode})

        const result = []

        for (const floor of floors){
            const rooms = await ROOM.find({floor_id:floor._id, pgcode})

            result.push({
                floor,
                rooms
            })
        }

        return res.status(200).json({message:"Floors and Rooms retrieved successfully.", success:true, data:result})

    }catch(err){
        next(err)
    }
}