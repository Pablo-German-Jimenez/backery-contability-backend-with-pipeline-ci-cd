import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import mongoose from "mongoose";
import { z } from "zod";
import Producto from "../models/Productos.js";

const escaparRegex = (texto) => texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const iniciarServidorMcp = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("Falta configurar la variable de entorno MONGO_URI");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const servidor = new McpServer({
    name: "panaderia-productos",
    version: "1.0.0",
  });

  servidor.registerTool(
    "buscar_productos",
    {
      title: "Buscar productos",
      description:
        "Busca productos de la panadería por nombre o variedad. Sin consulta, devuelve el catálogo actual. Solo lectura.",
      inputSchema: {
        consulta: z.string().trim().max(80).optional(),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
      },
    },
    async ({ consulta }) => {
      const termino = consulta?.trim();
      const filtro = termino
        ? new RegExp(escaparRegex(termino), "i")
        : undefined;
      const productos = await Producto.find(
        filtro
          ? {
              $or: [
                { nombre: filtro },
                { "variedades.nombre": filtro },
              ],
            }
          : {},
      )
        .select("nombre precio tipo stock variedades.nombre variedades.precio")
        .sort({ nombre: 1 })
        .limit(50)
        .lean();

      const datos = productos.map(
        ({ nombre, precio, tipo, stock, variedades = [] }) => ({
          nombre,
          precio,
          tipo,
          stock,
          variedades: variedades.slice(0, 20).map(
            ({ nombre: nombreVariedad, precio: precioVariedad }) => ({
              nombre: nombreVariedad,
              precio: precioVariedad,
            }),
          ),
        }),
      );

      return {
        content: [{ type: "text", text: JSON.stringify(datos) }],
      };
    },
  );

  const transporte = new StdioServerTransport();
  await servidor.connect(transporte);

  process.stdin.once("end", async () => {
    await servidor.close();
    await mongoose.disconnect();
  });
};

iniciarServidorMcp().catch((error) => {
  console.error("Error al iniciar el servidor MCP de productos", error);
  process.exitCode = 1;
});
