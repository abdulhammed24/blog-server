import express from "express";
import { sendEmailMsg } from "../../controllers/emailMsg/emailMsgCtrl.js";
import { authMiddleware } from "../../middlewares/auth/authMiddleware.js";
const router = express.Router();

router.post("/", authMiddleware, sendEmailMsg);

export default router;
