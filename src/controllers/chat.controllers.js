import { consultarCatalogoDirecto } from "../services/chat.services.js";

export const responderChat = async (req, res) => {
  const { mensaje, historial = [] } = req.body ?? {};

    if(typeof mensaje !== 'string'|| !mensaje.trim()){
        return res.status(400).json({mensaje:"El campo 'mensaje'es obligatorio"})
    }

    if(!Array.isArray(historial)){
        return res.status(400).json({respuesta: "El campo 'historial' debe ser una lista"});
    }

    try{
        const respuesta = await consultarCatalogoDirecto({
            mensaje:mensaje.trim(),
        })
        return res.status(200).json({respuesta});
    }catch(error){
        console.error("Error en el chat",error);
        return res.status(500).json({mensaje:"No se pudo consultar el catálogo de productos"})
    }

};

