import express from "express";
import cors from "cors";
import morgan from "morgan";
import ventasRoutes from "./routes/ventas.routes.js";
import productosRoutes from "./routes/productos.routes.js";
import inventarioRoutes from "./routes/inventario.routes.js";
import chatRoutes from "./routes/chat.routes.js"

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.get("/api/heath",(req,res)=>{
    res.json({status:"ok",message:"API Panaderia funcionando una maravilla"});
})

app.use("/api",ventasRoutes);
app.use("/api", productosRoutes);
app.use("/api", inventarioRoutes);
app.use("/api",chatRoutes);


app.get('/',(req,res)=>{
    res.status(200).json({
        status:'ok',
        message:'Backery Contability API corriendo'
    })
})
export default app;