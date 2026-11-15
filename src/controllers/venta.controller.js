import Venta from "../models/Venta.js";

export const crearVenta = async (req, res) => {
  try {
    const { items, total } = req.body;

    const nuevaVenta = new Venta({
      items,
      total
    });

    const ventaGuardada = await nuevaVenta.save();
    return res.status(201).json(ventaGuardada);
  } catch (error) {
    console.error("Error al guardar venta:", error);
    return res.status(500).json({ mensaje: "Error al registrar la venta", error: error.message });
  }
};

export const obtenerVentas = async (req, res) => {
  try {
    const ventas = await Venta.find().sort({ createdAt: -1 });
    return res.status(200).json(ventas);
  } catch (error) {
    return res.status(500).json({ mensaje: "Error al obtener ventas", error: error.message });
  }
};