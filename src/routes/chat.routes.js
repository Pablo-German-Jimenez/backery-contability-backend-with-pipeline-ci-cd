import { Router } from "express";
import { responderChat } from "../controllers/chat.controllers.js";

const router = Router();

router.post("/chat", responderChat);

export default router;
