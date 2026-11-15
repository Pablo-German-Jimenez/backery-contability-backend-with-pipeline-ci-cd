import { Router } from "express";
import {
  ajustarStock,
  listarInventario,
  obtenerMovimientos,
  obtenerProductoInventario,
  reporteStockBajo,
} from "../controllers/inventario.controller.js";

const router = Router();

// GET /api/inventario -> Listar productos con stock (query: q, tipo, lowStock)
router.get("/inventario", listarInventario);

// GET /api/inventario/reportes/stock-bajo -> Reporte de productos bajo stock minimo
router.get("/inventario/reportes/stock-bajo", reporteStockBajo);

// GET /api/inventario/movimientos -> Historial de movimientos (query: productoId, tipo, limit)
router.get("/inventario/movimientos", obtenerMovimientos);

// GET /api/inventario/:id -> Detalle de un producto
router.get("/inventario/:id", obtenerProductoInventario);

// POST /api/inventario/ajustar-stock -> Ajustar stock (body: productoId, delta, tipo, motivo, referencia)
router.post("/inventario/ajustar-stock", ajustarStock);

export default router;
