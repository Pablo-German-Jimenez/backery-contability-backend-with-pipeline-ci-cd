import "dotenv/config";
import app from "./app.js";
import {connectDB} from "./config/db.js";
import { closeMcpClient, connectMcpClient } from "./services/mcpClient.js";

const PORT = process.env.PORT || 4000;

const startServer = async ()=>{
    await connectDB();
    await connectMcpClient();
    const server = app.listen(PORT, ()=>{
        console.log(`Servidor corriendo en http://localhost:${PORT}`)
    })

    const shutdown = () => {
        server.close(async () => {
            await closeMcpClient();
            process.exit(0);
        });
    };

    process.once("SIGINT", shutdown);
    process.once("SIGTERM", shutdown);
}

startServer().catch((error) => {
    console.error("No se pudo iniciar el backend", error);
    process.exitCode = 1;
});