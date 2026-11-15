import mongoose from "mongoose";

const MovimientoInventarioSchema = new mongoose.Schema(
  {
    productoId: { type: mongoose.Types.ObjectId, ref: "Producto", required: true },
    delta: { type: Number, required: true },
    tipo: { type: String, enum: ["entrada", "salida", "ajuste"], required: true },
    motivo: { type: String, default: "", trim: true },
    // Ex: "venta", "compra", "merma", "correccion"
    referencia: { type: String, default: "", trim: true },
    stockAnterior: { type: Number, default: 0 },
    stockNuevo: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("MovimientoInventario", MovimientoInventarioSchema);
