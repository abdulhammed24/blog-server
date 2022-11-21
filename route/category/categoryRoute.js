import express from "express";
import {
  createCategory,
  fetchCategories,
  fetchCategory,
  updateCategory,
  deleteCateory,
} from "../../controllers/category/categoryCtrl.js";

import { authMiddleware } from "../../middlewares/auth/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createCategory);
router.get("/", fetchCategories);
router.get("/:id", fetchCategory);
router.put("/:id", authMiddleware, updateCategory);
router.delete("/:id", authMiddleware, deleteCateory);

export default router;
