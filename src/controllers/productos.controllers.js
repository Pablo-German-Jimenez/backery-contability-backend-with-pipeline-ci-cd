import mongoose from "mongoose";
import Producto from "../models/Productos.js";

const serializarProducto = (producto) => {
  const datos =
    typeof producto.toObject === "function" ? producto.toObject() : producto;

  return {
    ...datos,
    id: String(datos._id),
    variedades: (datos.variedades ?? []).map((variedad) => ({
      ...variedad,
      id: String(variedad._id),
    })),
  };
};

const obtenerDatosProducto = (entrada, conservarIdsVariedades = false) => {
  const datos = {};
  for (const campo of [
    "nombre",
    "precio",
    "tipo",
    "stock",
    "stockMinimo",
  ]) {
    if (Object.hasOwn(entrada, campo)) {
      datos[campo] = entrada[campo];
    }
  }

  if (Object.hasOwn(entrada, "variedades")) {
    datos.variedades = entrada.variedades.map((variedad) => {
      const datosVariedad = {
        nombre: variedad.nombre,
        precio: variedad.precio,
      };
      const idVariedad = variedad._id ?? variedad.id;

      if (
        conservarIdsVariedades &&
        mongoose.isValidObjectId(idVariedad)
      ) {
        datosVariedad._id = idVariedad;
      }
      if (typeof variedad.img === "string") {
        datosVariedad.img = variedad.img;
      }

      return datosVariedad;
    });
  }

  return datos;
};

const esObjeto = (valor) =>
  valor !== null && typeof valor === "object" && !Array.isArray(valor);

const validarProducto = (entrada) =>
  esObjeto(entrada) &&
  (!Object.hasOwn(entrada, "variedades") ||
    (Array.isArray(entrada.variedades) &&
      entrada.variedades.every(esObjeto)));

const responderError = (res, error, mensaje) => {
  console.error(mensaje, error);
  const esEntradaInvalida =
    error.name === "ValidationError" || error.name === "CastError";

  return res.status(esEntradaInvalida ? 400 : 500).json({
    mensaje: esEntradaInvalida ? error.message : mensaje,
  });
};

export const obtenerProductos = async (_req, res) => {
  try {
    const productos = await Producto.find().sort({ nombre: 1 });
    return res.status(200).json(productos.map(serializarProducto));
  } catch (error) {
    return responderError(res, error, "Error al obtener productos");
  }
};

export const importarCatalogoInicial = async (req, res) => {
  const productos = req.body?.productos;
  if (
    !Array.isArray(productos) ||
    productos.length === 0 ||
    !productos.every(validarProducto)
  ) {
    return res.status(400).json({
      mensaje: "Debes enviar una lista válida de productos para importar.",
    });
  }

  try {
    if ((await Producto.countDocuments()) > 0) {
      const catalogo = await Producto.find().sort({ nombre: 1 });
      return res.status(409).json({
        mensaje: "El catálogo ya está inicializado.",
        productos: catalogo.map(serializarProducto),
      });
    }

    const importados = await Producto.insertMany(
      productos.map((producto) =>
        obtenerDatosProducto(producto),
      ),
    );
    return res.status(201).json(importados.map(serializarProducto));
  } catch (error) {
    return responderError(res, error, "No se pudo importar el catálogo inicial");
  }
};

export const crearProducto = async (req, res) => {
  if (!validarProducto(req.body)) {
    return res.status(400).json({ mensaje: "El producto enviado no es válido." });
  }

  try {
    const producto = await Producto.create(obtenerDatosProducto(req.body));
    return res.status(201).json(serializarProducto(producto));
  } catch (error) {
    return responderError(res, error, "No se pudo crear el producto");
  }
};

export const actualizarProducto = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ mensaje: "El identificador del producto no es válido." });
  }
  if (!validarProducto(req.body)) {
    return res.status(400).json({ mensaje: "Los cambios enviados no son válidos." });
  }

  try {
    const cambios = obtenerDatosProducto(req.body, true);
    if (Object.keys(cambios).length === 0) {
      return res.status(400).json({ mensaje: "No se recibieron cambios para guardar." });
    }

    const producto = await Producto.findByIdAndUpdate(
      req.params.id,
      { $set: cambios },
      { new: true, runValidators: true },
    );
    if (!producto) {
      return res.status(404).json({ mensaje: "No se encontró el producto." });
    }

    return res.status(200).json(serializarProducto(producto));
  } catch (error) {
    return responderError(res, error, "No se pudo actualizar el producto");
  }
};

export const eliminarProducto = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ mensaje: "El identificador del producto no es válido." });
  }

  try {
    const producto = await Producto.findByIdAndDelete(req.params.id);
    if (!producto) {
      return res.status(404).json({ mensaje: "No se encontró el producto." });
    }

    return res.status(200).json({ mensaje: "Producto eliminado." });
  } catch (error) {
    return responderError(res, error, "No se pudo eliminar el producto");
  }
};
