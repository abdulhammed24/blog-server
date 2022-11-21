import express from "express";
import {
  accountVerification,
  blockUser,
  deleteUser,
  fetchUserById,
  followingUser,
  forgetPasswordToken,
  generateVerificationToken,
  login,
  passwordReset,
  profilePhotoUpload,
  register,
  unBlockUser,
  unfollowUser,
  updateUser,
  updateUserPassword,
  userProfile,
  users,
} from "../../controllers/users/usersCtrl.js";
import { authMiddleware } from "../../middlewares/auth/authMiddleware.js";
import {
  photoUpload,
  profilePhotoResize,
} from "../../middlewares/uploads/photoUpload.js";

const router = express.Router();

// register user
router.post("/register", register);
// login user
router.post("/login", login);

// Profile Picture Upload
router.put(
  "/profilephoto-upload",
  authMiddleware,
  photoUpload.single("image"),
  profilePhotoResize,
  profilePhotoUpload
);
// get all user
router.get("/", authMiddleware, users);
// Generate Forget Password token
router.post("/forget-password-token", forgetPasswordToken);
// Password Reset Verification
router.put("/reset-password", passwordReset);

// allow user to update their password after login
router.put("/password", authMiddleware, updateUserPassword);
// follow user
router.put("/follow", authMiddleware, followingUser);

// unfollow users
router.put("/unfollow", authMiddleware, unfollowUser);

// generate email verification token
router.post(
  "/generate-verify-email-token",
  authMiddleware,
  generateVerificationToken
);

// verify account
router.put("/verify-account", authMiddleware, accountVerification);

// block a user
router.put("/block-user/:id", authMiddleware, blockUser);
// unblock a user
router.put("/unblock-user/:id", authMiddleware, unBlockUser);
// get userprofile by id when logged in
router.get("/profile/:id", authMiddleware, userProfile);
// update userprofile
router.put("/", authMiddleware, updateUser);
// delete user by id
router.delete("/:id", deleteUser);
// fetch user by id
router.get("/:id", fetchUserById);

export default router;
