import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import dbConnect from "./config/db/dbConnect.js";
import userRoutes from "./route/users/usersRoute.js";
import postRoute from "./route/posts/postRoute.js";
import commentRoute from "./route/comments/commentRoute.js";
import emailMsgRoute from "./route/emailMsg/emailMsgRoute.js";
import categoryRoute from "./route/category/categoryRoute.js";
import { errorHandler, notFound } from "./middlewares/error/errorHandler.js";

const app = express();

dotenv.config();
// database
dbConnect();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// cors
app.use(cors());
const { createProxyMiddleware } = require("http-proxy-middleware");
app.use(
  "/api",
  createProxyMiddleware({
    target: "http://localhost:8080/", //original url
    changeOrigin: true,
    //secure: false,
    onProxyRes: function (proxyRes, req, res) {
      proxyRes.headers["Access-Control-Allow-Origin"] = "*";
    },
  })
);

// register and login
app.use("/auth", userRoutes);

// users
app.use("/users", userRoutes);

// posts
app.use("/posts", cors(), postRoute);

// comments
app.use("/comments", commentRoute);

// email messages
app.use("/email", emailMsgRoute);

// category
app.use("/category", categoryRoute);

// error handler
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8000;

app.listen(PORT, console.log(`Server is running  on port ${PORT}`));
