import mongoose from "mongoose";
import Producto from "../models/Productos.js";
import MovimientoInventario from "../models/MovimientoInventario.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

export const listarInventario = async (req, res) => {
  try {
    const { q, lowStock, tipo } = req.query;
    const filter = {};

    if (tipo && ["unidad", "dinero"].includes(tipo)) filter.tipo = tipo;
    if (q) filter.nombre = { $regex: q, $options: "i" };
    if (lowStock === "true" || lowStock === "1") {
      // MongoDB comparison across two fields requires $expr
      filter.$expr = { $lte: ["$stock", "$stockMinimo"] };
    }

    const productos = await Producto.find(filter).sort({ nombre: 1 });
    return res.status(200).json(productos);
  } catch (error) {
    return res.status(500).json({ mensaje: "Error al obtener inventario", error: error.message });
  }
};

export const obtenerProductoInventario = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ mensaje: "ID invalido" });

    const producto = await Producto.findById(id);
    if (!producto) return res.status(404).json({ mensaje: "Producto no encontrado" });

    return res.status(200).json(producto);
  } catch (error) {
    return res.status(500).json({ mensaje: "Error al obtener producto", error: error.message });
  }
};

export const ajustarStock = async (req, res) => {
  try {
    const { productoId, delta, tipo, motivo = "", referencia = "" } = req.body;

    if (!productoId || !isValidId(productoId)) {
      return res.status(400).json({ mensaje: "productoId valido es requerido" });
    }
    if (typeof delta !== "number" || !Number.isFinite(delta) || delta === 0) {
      return res.status(400).json({ mensaje: "delta numerico distinto de 0 es requerido" });
    }
    if (!["entrada", "salida", "ajuste"].includes(tipo)) {
      return res.status(400).json({ mensaje: "tipo debe ser entrada|salida|ajuste" });
    }

    const producto = await Producto.findById(productoId);
    if (!producto) return res.status(404).json({ mensaje: "Producto no encontrado" });

    const stockAnterior = producto.stock ?? 0;
    const stockNuevo = stockAnterior + delta;

    if (stockNuevo < 0) {
      return res.status(400).json({ mensaje: "Stock insuficiente: el resultado seria negativo", stockAnterior, delta });
    }

    producto.stock = stockNuevo;
    await producto.save();

    const movimiento = await MovimientoInventario.create({
      productoId: producto._id,
      delta,
      tipo,
      motivo,
      referencia,
      stockAnterior,
      stockNuevo,
    });

    return res.status(200).json({ producto, movimiento });
  } catch (error) {
    return res.status(500).json({ mensaje: "Error al ajustar stock", error: error.message });
  }
};

export const obtenerMovimientos = async (req, res) => {
  try {
    const { productoId, tipo, limit = 100 } = req.query;
    const filter = {};

    if (productoId) {
      if (!isValidId(productoId)) return res.status(400).json({ mensaje: "productoId invalido" });
      filter.productoId = productoId;
    }
    if (tipo && ["entrada", "salida", "ajuste"].includes(tipo)) filter.tipo = tipo;

    const movimientos = await MovimientoInventario.find(filter)
      .sort({ createdAt: -1 })
      .limit(Math.min(Number(limit) || 100, 500))
      .populate("productoId", "nombre precio stock stockMinimo");

    return res.status(200).json(movimientos);
  } catch (error) {
    return res.status(500).json({ mensaje: "Error al obtener movimientos", error: error.message });
  }
};

export const reporteStockBajo = async (req, res) => {
  try {
    const productos = await Producto.find({
      $expr: { $lte: ["$stock", "$stockMinimo"] },
    }).sort({ stock: 1, nombre: 1 });

    return res.status(200).json(productos);
  } catch (error) {
    return res.status(500).json({ mensaje: "Error al generar reporte de stock bajo", error: error.message });
  }
};
