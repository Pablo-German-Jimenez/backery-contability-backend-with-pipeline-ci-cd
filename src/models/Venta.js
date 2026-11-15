import mongoose from "mongoose";

const ItemVentaSchema= new mongoose.Schema({
    nombre:{type:String, required:true},
    cantidad: {type:Number,default:0},
    totalItem:{type:Number,required:true},
});

const VentaSchema = new mongoose.Schema(
    {        
        total: {type:Number,required:true},
        items:[ItemVentaSchema],
    },
    {timestamps:true}
);

const horaFormateada = new Date(VentaSchema.createdAt).toLocaleTimeString([,{
    hour:"2-digit",
    minute:"2-digit"
}]);

export default mongoose.model("Venta",VentaSchema);