import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import process from "node:process";
import { fileURLToPath } from "node:url";

let cliente;
let herramientas = [];

export const connectMcpClient = async () => {
  if (cliente) {
    return herramientas;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("Falta configurar la variable de entorno MONGO_URI");
  }

  const transporte = new StdioClientTransport({
    command: process.execPath,
    args: [fileURLToPath(new URL("../mcp/server.js", import.meta.url))],
    env: { MONGO_URI: process.env.MONGO_URI },
    stderr: "inherit",
  });
  const nuevoCliente = new Client({
    name: "panaderia-backend",
    version: "1.0.0",
  });

  try {
    await nuevoCliente.connect(transporte);
    const respuesta = await nuevoCliente.listTools();
    if (!respuesta.tools.some(({ name }) => name === "buscar_productos")) {
      throw new Error("El servidor MCP no expone la herramienta buscar_productos");
    }

    cliente = nuevoCliente;
    herramientas = respuesta.tools;
    console.log("Cliente MCP conectado; herramienta buscar_productos disponible");
    return herramientas;
  } catch (error) {
    await nuevoCliente.close().catch((errorCierre) => {
      console.error("Error al cerrar el cliente MCP", errorCierre);
    });
    throw new Error("No se pudo conectar con el servidor MCP de productos", {
      cause: error,
    });
  }
};

export const listMcpTools = async () => {
  if (!cliente) {
    throw new Error("El cliente MCP no está conectado");
  }

  return herramientas;
};

export const callMcpTool = async (name, args) => {
  if (!cliente || !herramientas.some((herramienta) => herramienta.name === name)) {
    throw new Error(`La herramienta MCP '${name}' no está disponible`);
  }

  const resultado = await cliente.callTool({ name, arguments: args });
  if (resultado.isError) {
    const detalle = resultado.content
      .filter((item) => item.type === "text")
      .map((item) => item.text)
      .join("\n");
    throw new Error(detalle || `La herramienta MCP '${name}' falló`);
  }

  return resultado.content
    .filter((item) => item.type === "text")
    .map((item) => item.text)
    .join("\n");
};

export const closeMcpClient = async () => {
  if (!cliente) {
    return;
  }

  const clienteActual = cliente;
  cliente = undefined;
  herramientas = [];
  await clienteActual.close();
};