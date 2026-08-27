import mongoose from "mongoose";

const VariedadSchema = new mongoose.Schema({
  nombre: { type: String, requrired: true },
  precio: { type: Number, required: true },
  img: { type: String, default: "" },
});

const ProductoSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  precio: {type:Number,required:true},
  tipo:{type:String,enum:["unidad","dinero"],default:"unidad"},
  variedades:[VariedadSchema],
},
{timeStamps:true});

export default mongoose.model("Producto",ProductoSchema);