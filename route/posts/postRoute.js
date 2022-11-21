import express from "express";
import {
  createPost,
  fetchPosts,
  fetchPost,
  updatePost,
  deletePost,
  toggleAddLikeToPost,
  toggleAddDislikeToPost,
} from "../../controllers/posts/postCtrl.js";
import { authMiddleware } from "../../middlewares/auth/authMiddleware.js";
import {
  photoUpload,
  postImgResize,
} from "../../middlewares/uploads/photoUpload.js";

const router = express.Router();

// create post
router.post(
  "/",
  authMiddleware,
  photoUpload.single("image"),
  postImgResize,
  createPost
);

// like post
router.put("/likes", authMiddleware, toggleAddLikeToPost);
// dislike post
router.put("/dislikes", authMiddleware, toggleAddDislikeToPost);
// get or fetch all posts
router.get("/", fetchPosts);
// get single post
router.get("/:id", fetchPost);
// update post
router.put("/:id", authMiddleware, updatePost);
// delete post
router.delete("/:id", authMiddleware, deletePost);

export default router;
