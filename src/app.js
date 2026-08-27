import express from "express";
import cors from "cors";
import morgan from "morgan";

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.get("/api/heath",(req,res)=>{
    res.json({status:"ok",message:"API Panaderia funcionando una maravilla"});
})

export default app;