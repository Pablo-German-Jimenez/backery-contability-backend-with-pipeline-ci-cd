Deploy proyecto! https://bakery-accounting-book.netlify.app/

# 🥖 Backend - Sistema de Libro Diario (Panadería)

API RESTful desarrollada con **Node.js**, **Express** y **MongoDB** para gestionar los movimientos contables, ingresos, egresos y balance diario del sistema de administración de la panadería.

---

## 🛠️ Tecnologías

- **Runtime:** Node.js
- **Framework:** Express.js
- **Base de Datos:** MongoDB & Mongoose ODM
- **Validación y Utilidades:** Express-validator, CORS, dotenv, Morgan

---

## 📂 Estructura del Proyecto


src/
├── config/             # Conexión a la base de datos (db.js)
├── controllers/        # Controladores (movimientos, arqueos, cierres)
├── middlewares/        # Validaciones de entrada de datos
├── models/             # Esquemas de Mongoose (Movimiento, CierreDiario, etc.)
├── routes/             # Endpoints de la API
├── utils/              # Helpers y utilidades de cálculo
├── app.js              # Configuración de Express y middlewares
└── index.js            # Punto de entrada y servidor
⚙️ Instalación y Configuración
Clonar el repositorio:

Bash
git clone [https://github.com/tu-usuario/libro-diario-panaderia-backend.git](https://github.com/tu-usuario/libro-diario-panaderia-backend.git)
cd libro-diario-panaderia-backend
Instalar dependencias:

Bash
npm install
Variables de entorno:
Crea un archivo .env en la raíz del proyecto con la siguiente estructura:

Fragmento de código
PORT=4000
MONGODB_URI=mongodb+srv://<usuario>:<password>@cluster.mongodb.net/panaderia_libro_diario?retryWrites=true&w=majority
CLIENT_URL=http://localhost:5173
Ejecución:

Modo desarrollo:

Bash
npm run dev
Modo producción:

Bash
npm start
📡 Endpoints de la API
📒 Movimientos Diarios (/api/movimientos)
GET /api/movimientos — Obtener lista completa de registros (soporta filtros por fecha, turno o tipo).

GET /api/movimientos/:id — Obtener detalle de un movimiento específico.

POST /api/movimientos — Registrar un nuevo movimiento (ingreso o egreso).

PUT /api/movimientos/:id — Editar un movimiento existente.

DELETE /api/movimientos/:id — Eliminar un registro.

💰 Arqueo y Cierre de Caja (/api/caja o /api/balance)
GET /api/balance/hoy — Obtener el balance acumulado del día actual (total ventas, compras, saldo neto).

GET /api/balance/historico — Consulta de totales agrupados por rango de fechas o mes.

POST /api/caja/cierre — Guardar el balance y cierre de turno/jornada.

📋 Ejemplo de Payload (Nuevo Movimiento)
JSON
{
  "fecha": "2026-08-27T08:30:00.000Z",
  "tipo": "ingreso", 
  "categoria": "Venta Mostrador",
  "monto": 15500.00,
  "metodoPago": "efectivo",
  "descripcion": "Venta turno mañana - panes y facturas",
  "responsable": "Turno Mañana"
};



✨ Author
Created by Pablo Germán Jiménez
Design inspired by 💥 hip-hop vibes from Bboy Linkin

###### [Access to profile GitHub](https://github.com/Pablo-German-Jimenez)💻
###### [Access to profile Linkedin](https://www.linkedin.com/in/pablo-german-jimenez-0b706a200/)📊

#💥 Breaker-boy for ever🎵 

 ![🔥#Bboys on fire 🎵 ](https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExeG11M2dtOHdnYWUxN3N6NTFoZ2t5Z24xcmV5djJjcjI4ODlyZ3duZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ANFZtmUiXncuUmKMwY/giphy.gif)
