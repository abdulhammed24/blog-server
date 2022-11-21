import User from "../../model/user/User.js";
import asyncHandler from "express-async-handler";
import generateToken from "../../config/token/generateToken.js";
import { validateMongodbId } from "../../utils/validateMongodbID.js";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { cloudinaryUploadImg } from "../../utils/cloudinary.js";
import fs from "fs";
import { blockUsers } from "../../utils/blockUser.js";

// register
export const register = asyncHandler(async (req, res) => {
  //Check if user Exist
  const userExists = await User.findOne({ email: req?.body?.email });

  if (userExists) throw new Error("User already exists");
  try {
    const user = await User.create({
      firstName: req?.body?.firstName,
      lastName: req?.body?.lastName,
      email: req?.body?.email,
      password: req?.body?.password,
    });
    res.json(user);
  } catch (error) {
    res.json(error);
  }
});

// login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // console.log(req.body);
  //check if user exists
  const userFound = await User.findOne({ email });
  //check if blocked
  if (userFound?.isBlocked)
    throw new Error("Access Denied You have been blocked");
  if (userFound && (await userFound.isPasswordMatched(password))) {
    //Check if password is match
    res.json({
      _id: userFound?._id,
      firstName: userFound?.firstName,
      lastName: userFound?.lastName,
      email: userFound?.email,
      profilePhoto: userFound?.profilePhoto,
      isAdmin: userFound?.isAdmin,
      token: generateToken(userFound?._id),
      isVerified: userFound?.isAccountVerified,
    });
  } else {
    res.status(401);
    throw new Error("Invalid Login Credentials");
  }
});

//get all users
export const users = asyncHandler(async (req, res) => {
  // console.log(req.headers);
  try {
    // const users = await User.find({});
    const users = await User.find({}).populate("posts");
    res.json(users);
  } catch (error) {
    res.json(error);
  }
});

// delete user by id
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  //check if user id is valid
  validateMongodbId(id);
  try {
    const deletedUser = await User.findByIdAndDelete(id);
    res.json(deletedUser);
  } catch (error) {
    res.json(error);
  }
});

// get a single user
export const fetchUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  //check if user id is valid
  validateMongodbId(id);
  try {
    const user = await User.findById(id);
    res.json(user);
  } catch (error) {
    res.json(error);
  }
});

// get user profile only by logged in user
export const userProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  //1.Find the login user
  //2. Check this particular if the login user exists in the array of viewedBy

  //Get the login user
  const loginUserId = req?.user?._id?.toString();
  // console.log(typeof loginUserId);
  try {
    const myProfile = await User.findById(id)
      .populate("posts")
      .populate("viewedBy");
    const alreadyViewed = myProfile?.viewedBy?.find((user) => {
      // console.log(user);
      return user?._id?.toString() === loginUserId;
    });
    if (alreadyViewed) {
      res.json(myProfile);
    } else {
      const profile = await User.findByIdAndUpdate(myProfile?._id, {
        $push: { viewedBy: loginUserId },
      });
      res.json(profile);
    }
  } catch (error) {
    res.json(error);
  }
});

// update user profile
export const updateUser = asyncHandler(async (req, res) => {
  const { _id } = req?.user;
  //block
  blockUsers(req?.user);
  validateMongodbId(_id);
  const user = await User.findByIdAndUpdate(
    _id,
    {
      firstName: req?.body?.firstName,
      lastName: req?.body?.lastName,
      email: req?.body?.email,
      bio: req?.body?.bio,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.json(user);
});

// allow user to update their password after login
export const updateUserPassword = asyncHandler(async (req, res) => {
  //destructure the login user
  const { _id } = req.user;
  const { password } = req.body;
  validateMongodbId(_id);
  //Find the user by _id
  const user = await User.findById(_id);

  if (password) {
    user.password = password;
    const updatedUser = await user.save();
    res.json(updatedUser);
  } else {
    res.json(user);
  }
});

// following
export const followingUser = asyncHandler(async (req, res) => {
  //1.Find the user you want to follow and update it's followers field
  //2. Update the login user following field
  const { followId } = req.body;
  const loginUserId = req.user.id;

  //find the target user and check if the login id exist
  const targetUser = await User.findById(followId);

  const alreadyFollowing = targetUser?.followers?.find(
    (user) => user?.toString() === loginUserId.toString()
  );

  if (alreadyFollowing) throw new Error("You have already followed this user");

  //1. Find the user you want to follow and update it's followers field
  await User.findByIdAndUpdate(
    followId,
    {
      $push: { followers: loginUserId },
      isFollowing: true,
    },
    { new: true }
  );

  //2. Update the login user following field
  await User.findByIdAndUpdate(
    loginUserId,
    {
      $push: { following: followId },
    },
    { new: true }
  );
  res.json("You have successfully followed this user");
});

// unfollow
export const unfollowUser = asyncHandler(async (req, res) => {
  const { unFollowId } = req.body;
  const loginUserId = req.user.id;

  await User.findByIdAndUpdate(
    unFollowId,
    {
      $pull: { followers: loginUserId },
      isFollowing: false,
    },
    { new: true }
  );

  await User.findByIdAndUpdate(
    loginUserId,
    {
      $pull: { following: unFollowId },
    },
    { new: true }
  );

  res.json("You have successfully unfollowed this user");
});

// block a user
export const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);

  const user = await User.findByIdAndUpdate(
    id,
    {
      isBlocked: true,
    },
    { new: true }
  );
  res.json(user);
});

// unblock a user
export const unBlockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);

  const user = await User.findByIdAndUpdate(
    id,
    {
      isBlocked: false,
    },
    { new: true }
  );
  res.json(user);
});

// generate email verification token
export const generateVerificationToken = asyncHandler(async (req, res) => {
  // res.send("email");
  const loginUserId = req.user.id;
  // console.log(loginUserId);
  const user = await User.findById(loginUserId);

  try {
    //Generate token
    const verificationToken = await user?.createAccountVerificationToken();
    // console.log(verificationToken);
    //save the user
    await user.save();

    //build your message
    const resetURL = `If you were requested to verify your account, verify now within 10 minutes, otherwise ignore this message <a href="https://v-post.vercel.app/verify-account/${verificationToken}">Click to verify your account</a>`;

    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const msg = {
      from: "abdlhamd3@gmail.com", // Sender email
      to: user?.email, // Receiver email
      subject: "Verification", // Title email
      text: "This is a verification message", // Text in email
      html: resetURL, // Html in email
    };

    await transporter.sendMail(msg);

    res.json(resetURL);
  } catch (error) {
    res.json(error);
  }
});

//Account verification
export const accountVerification = asyncHandler(async (req, res) => {
  const { token } = req.body;
  // console.log(token);
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  //find this user by token
  const userFound = await User.findOne({
    accountVerificationToken: hashedToken,
    accountVerificationTokenExpires: { $gt: new Date() },
  });
  if (!userFound) throw new Error("Token expired, try again later");
  //update the property to true
  userFound.isAccountVerified = true;
  userFound.accountVerificationToken = undefined;
  userFound.accountVerificationTokenExpires = undefined;
  await userFound.save();
  res.json(userFound);
});

// Generate Forget Password token
export const forgetPasswordToken = asyncHandler(async (req, res) => {
  //find the user by email
  const { email } = req.body;
  // console.log(email);
  const user = await User.findOne({ email });

  if (!user) throw new Error("User Not Found");

  try {
    //Create token
    const token = await user.createPasswordResetToken();

    await user.save();

    //build your message
    const resetURL = `If you were requested to reset your password, reset now within 10 minutes, otherwise ignore this message <a href="https://v-post.vercel.app/reset-password/${token}">Click to Reset</a>`;

    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const msg = {
      from: "abdlhamd3@gmail.com", // Sender email
      to: user?.email, // Receiver email
      subject: "Reset Password", // Title email
      text: "This is a password reset message", // Text in email
      html: resetURL, // Html in email
    };

    await transporter.sendMail(msg);
    res.json({
      msg: `A verification message is successfully sent to ${user?.email}. Reset now within 10 minutes, ${resetURL}`,
    });
  } catch (error) {
    res.json(error);
  }
});

// Password Reset Verification
export const passwordReset = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  //find this user by token
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) throw new Error("Token Expired, try again later");

  //Update/change the password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.json(user);
});

// Profile Picture Upload
export const profilePhotoUpload = asyncHandler(async (req, res) => {
  // //Find the login user
  const { _id } = req.user;
  // //block user
  blockUsers(req?.user);
  //1. Get the path to img
  const localPath = `public/images/profile/${req.file.filename}`;
  //2.Upload to cloudinary
  const imgUploaded = await cloudinaryUploadImg(localPath);
  // console.log(imgUploaded);

  const foundUser = await User.findByIdAndUpdate(
    _id,
    {
      profilePhoto: imgUploaded?.url,
    },
    { new: true }
  );
  //remove the saved img
  fs.unlinkSync(localPath);
  res.json(foundUser);
  // res.json(imgUploaded);
});
