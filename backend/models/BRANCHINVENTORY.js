import mongoose from "mongoose";

const branchInventorySchema = new mongoose.Schema({
  branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
  pgcode: { type: String, required: true, ref: "Loginmapping" },
  item_name: String,
  item_type: String,
  total_quantity: Number,
  unit: String,
  added_by: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  updated_by: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
}, { timestamps: true });

export default mongoose.model("BranchInventory", branchInventorySchema);