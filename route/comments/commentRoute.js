import express from "express";
import {
  createComment,
  fetchAllComments,
  fetchComment,
  updateComment,
  deleteComment,
} from "../../controllers/comments/commentCtrl.js";

import { authMiddleware } from "../../middlewares/auth/authMiddleware.js";

const router = express.Router();

// create  a comment
router.post("/", authMiddleware, createComment);
// fetch or get  all comments
router.get("/", fetchAllComments);
// fetch or get  single comment
router.get("/:id", authMiddleware, fetchComment);
// update  a comment
router.put("/:id", authMiddleware, updateComment);
// delete  a comment
router.delete("/:id", authMiddleware, deleteComment);

export default router;
