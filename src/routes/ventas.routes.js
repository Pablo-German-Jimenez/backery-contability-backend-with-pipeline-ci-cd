import { Router } from "express";
import { crearVenta, obtenerVentas } from "../controllers/venta.controller.js";

const router = Router();

// POST /api/ventas -> Registrar una nueva venta
router.post("/ventas", crearVenta);

// GET /api/ventas -> Consultar historial del día
router.get("/ventas", obtenerVentas);

export default router;