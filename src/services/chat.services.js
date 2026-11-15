import OpenAI from "openai";
import { callMcpTool, listMcpTools } from "./mcpClient.js";

const normalizarTexto = (texto) =>
  texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const palabrasIgnoradas = new Set([
  "de", "del", "el", "la", "las", "los", "un", "una", "unos", "unas",
  "y", "o", "que", "cual", "cuanto", "cuesta", "precio", "precios",
  "stock", "hay", "tiene", "tienen", "quiero", "saber", "dime", "decime",
  "mostrar", "muestra", "ver", "listar", "catalogo", "producto", "productos",
  "disponible", "disponibles", "por", "favor", "me", "gustaria",
]);

const contienePalabra = (texto, palabra) => {
  const variantes = [palabra];
  if (palabra.endsWith("es") && palabra.length > 4) {
    variantes.push(palabra.slice(0, -2));
  } else if (palabra.endsWith("s") && palabra.length > 3) {
    variantes.push(palabra.slice(0, -1));
  }

  return variantes.some((variante) => {
    const escapada = variante.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|[^a-z0-9])${escapada}($|[^a-z0-9])`).test(texto);
  });
};

const esConsultaDeCatalogoCompleto = (mensaje) =>
  /\b(catalogo|lista( de)? productos|productos disponibles|ver productos|mostrar( todos)? productos|que productos (hay|tienen|venden|ofrecen)|que venden|que hay)\b/.test(
    normalizarTexto(mensaje),
  );

const palabrasProducto = (producto) =>
  [producto.nombre, ...(producto.variedades ?? []).map(({ nombre }) => nombre)]
    .filter((nombre) => typeof nombre === "string")
    .flatMap((nombre) => normalizarTexto(nombre).split(/[^a-z0-9]+/))
    .filter((palabra) => palabra.length >= 3 && !palabrasIgnoradas.has(palabra));

const formatearPrecio = (precio) =>
  typeof precio === "number" && Number.isFinite(precio)
    ? `$${precio.toLocaleString("es-AR")}`
    : "no disponible";

export const formatearRespuestaCatalogo = (mensaje, productos) => {
  if (!Array.isArray(productos)) {
    throw new Error("El MCP devolvió un catálogo con formato inválido");
  }

  const consulta = normalizarTexto(mensaje);
  const productosEncontrados = productos.filter((producto) =>
    palabrasProducto(producto).some((palabra) =>
      contienePalabra(consulta, palabra),
    ),
  );
  let resultados = productosEncontrados;
  if (!resultados.length && esConsultaDeCatalogoCompleto(mensaje)) {
    resultados = productos;
  }

  if (!resultados.length) {
    return `No encontré productos que coincidan con "${mensaje}". Escribe el nombre o variedad del producto, o pide ver el catálogo completo.`;
  }

  const detalleProductos = resultados.map((producto) => {
    const detalles = [
      `• ${producto.nombre}: precio ${formatearPrecio(producto.precio)}`,
    ];

    if (typeof producto.stock === "number") {
      detalles.push(`stock ${producto.stock}`);
    }

    if (producto.variedades?.length) {
      const variedades = producto.variedades
        .map(
          (variedad) =>
            `${variedad.nombre} (${formatearPrecio(variedad.precio)})`,
        )
        .join(", ");
      detalles.push(`variedades: ${variedades}`);
    }

    return detalles.join("; ");
  });

  return detalleProductos.join("\n");
};

export const consultarCatalogoDirecto = async ({ mensaje }) => {
  const contenido = await callMcpTool("buscar_productos", {});
  const productos = JSON.parse(contenido);
  return formatearRespuestaCatalogo(mensaje, productos);
};

const limpiarHistorial = (historial) =>
  historial
    .filter(
      (item) =>
        item &&
        ["user", "assistant"].includes(item.role) &&
        typeof item.content === "string",
    )
    .slice(-10)
    .map(({ role, content }) => ({
      role,
      content: content.slice(0, 2000),
    }));

const MAX_ITERACIONES_HERRAMIENTAS = 5;

export const generarRespuesta = async ({ mensaje, historial = [] }) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Falta configurar la variable de entorno OPENAI_API_KEY");
  }

  const openai = new OpenAI({ apiKey, timeout: 60_000, maxRetries: 1 });
  const herramientasMcp = await listMcpTools();
  const herramientasOpenAI = herramientasMcp.map((herramienta) => ({
    type: "function",
    function: {
      name: herramienta.name,
      description: herramienta.description ?? "",
      parameters: {
        type: herramienta.inputSchema.type,
        properties: herramienta.inputSchema.properties ?? {},
        ...(herramienta.inputSchema.required
          ? { required: herramienta.inputSchema.required }
          : {}),
      },
    },
  }));
  const mensajes = [
    {
      role: "system",
      content:
        "Eres el asistente de una panadería. Responde en español. Para informar sobre productos, precios o stock, consulta siempre las herramientas disponibles y basa la respuesta únicamente en sus resultados. Si no encuentras un producto, dilo claramente y no inventes datos. No afirmes que realizaste cambios ni operaciones.",
    },
    ...limpiarHistorial(historial),
    { role: "user", content: mensaje },
  ];

  for (let iteracion = 0; iteracion < MAX_ITERACIONES_HERRAMIENTAS; iteracion += 1) {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: mensajes,
      tools: herramientasOpenAI,
      tool_choice: "auto",
    });

    const respuesta = completion.choices[0]?.message;
    if (!respuesta) {
      throw new Error("OpenAI devolvió una respuesta vacía o inválida");
    }

    mensajes.push(respuesta);
    if (!respuesta.tool_calls?.length) {
      if (typeof respuesta.content !== "string" || !respuesta.content.trim()) {
        throw new Error("OpenAI devolvió una respuesta vacía o inválida");
      }

      return respuesta.content.trim();
    }

    for (const llamada of respuesta.tool_calls) {
      if (llamada.type !== "function") {
        throw new Error("OpenAI solicitó un tipo de herramienta no compatible");
      }

      const argumentos = JSON.parse(llamada.function.arguments);
      const resultado = await callMcpTool(llamada.function.name, argumentos);
      mensajes.push({
        role: "tool",
        tool_call_id: llamada.id,
        content: resultado,
      });
    }
  }

  throw new Error("OpenAI excedió el límite de llamadas a herramientas MCP");
};
