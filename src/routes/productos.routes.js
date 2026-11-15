import { Router } from "express";
import {
  actualizarProducto,
  crearProducto,
  eliminarProducto,
  importarCatalogoInicial,
  obtenerProductos,
} from "../controllers/productos.controllers.js";
import { requireTrustedOrigin } from "../config/iaSession.js";

const router = Router();

// GET /api/productos -> Consultar productos
router.get("/productos", obtenerProductos);
router.post(
  "/productos/importar-iniciales",
  requireTrustedOrigin,
  importarCatalogoInicial,
);
router.post("/productos", requireTrustedOrigin, crearProducto);
router.patch("/productos/:id", requireTrustedOrigin, actualizarProducto);
router.delete("/productos/:id", requireTrustedOrigin, eliminarProducto);

export default router;