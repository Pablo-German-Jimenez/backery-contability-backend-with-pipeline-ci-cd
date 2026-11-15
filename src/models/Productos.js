import mongoose from "mongoose";

const VariedadSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  precio: { type: Number, required: true },
  img: { type: String, default: "" },
});

const ProductoSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  precio: {type:Number,required:true},
  tipo:{type:String,enum:["unidad","dinero"],default:"unidad"},
  stock:{type:Number,default:0,min:0},
  stockMinimo:{type:Number,default:0,min:0},
  variedades:[VariedadSchema],
},
{timestamps:true});

export default mongoose.model("Producto",ProductoSchema);