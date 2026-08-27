import mongoose from "mongoose";

const ItemVentaSchema= new mongoose.Schema({
    nombre:{type:String, required:true},
    cantidad: {type:Number,default:0},
    totalItem:{type:Number,required:true},
});

const VentaSchema = new mongoose.Schema(
    {
        hora:{type:String,required:true},
        total: {type:Number,required:true},
        items:[ItemVentaSchema],
    },
    {timestamps:true}
);

export default mongoose.model("Venta",VentaSchemaa);