import mongoose from "mongoose";

const inventoryDistributionSchema = new mongoose.Schema({
  purchase: { type: mongoose.Schema.Types.ObjectId, ref: "Inventorypurch", required: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
  quantity: { type: Number, required: true },
  unit: { type: String }, // match purchase unit
  pgcode: { type: String, required: true, ref: "Loginmapping" },
  distributed_by: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
}, { timestamps: true });

export default mongoose.model("InventoryDistribution", inventoryDistributionSchema);