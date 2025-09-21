import mongoose from "mongoose";

const inventoryPurchaseSchema = new mongoose.Schema({
  item_name: { type: String, required: true },
  item_type: { type: String, enum: ["Vegetable", "Grocery", "Other"] },
  quantity: { type: Number, required: true },
  remaining_quantity: { type: Number, required: true },
  unit: { type: String, enum: ["kg", "ltr", "pcs", "box"], required: true },
  amount: { type: Number },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" }, // optional for branch-specific purchase
  pgcode: { type: String, required: true, ref: "Loginmapping" },
  stored_in: { type: String, enum: ["godown", "direct_branch"], default: "godown" },
  distributed: { type: Boolean, default: false },
  added_by: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" }, // NEW
  updated_by: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" } // optional for updates
}, { timestamps: true });


export default mongoose.model("Inventorypurch", inventoryPurchaseSchema);