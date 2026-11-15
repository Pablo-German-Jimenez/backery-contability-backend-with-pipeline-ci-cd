import assert from "node:assert/strict";
import test from "node:test";
import { formatearRespuestaCatalogo } from "./chat.services.js";

const productos = [
  {
    nombre: "Pan",
    precio: 3000,
    stock: 12,
    variedades: [{ nombre: "Integral", precio: 3500 }],
  },
  { nombre: "Facturas", precio: 400, stock: 25, variedades: [] },
];

test("responde con datos del producto mencionado en lenguaje natural", () => {
  const respuesta = formatearRespuestaCatalogo(
    "¿Cuál es el precio del pan?",
    productos,
  );

  assert.match(respuesta, /Pan: precio \$3\.000/);
  assert.match(respuesta, /stock 12/);
  assert.match(respuesta, /Integral \(\$3\.500\)/);
  assert.doesNotMatch(respuesta, /Facturas/);
});

test("encuentra productos cuando la consulta es solo su nombre", () => {
  const respuesta = formatearRespuestaCatalogo("Facturas", productos);

  assert.match(respuesta, /Facturas: precio \$400/);
});

test("devuelve el catálogo completo cuando se solicita", () => {
  const respuesta = formatearRespuestaCatalogo("¿Qué productos hay?", productos);

  assert.match(respuesta, /Pan/);
  assert.match(respuesta, /Facturas/);
});

test("orienta al usuario cuando no hay coincidencias", () => {
  const respuesta = formatearRespuestaCatalogo("¿Tienen medialunas?", productos);

  assert.match(respuesta, /No encontré productos/);
  assert.match(respuesta, /catálogo completo/);
});
