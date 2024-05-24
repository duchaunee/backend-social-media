import express from "express";
import {
  accessTokenMiddleware,
  loginMiddleware,
  registerMiddleware,
} from "../middlewares/auth.middleware";
import {
  loginController,
  registerController,
  logoutController,
} from "../controller/auth.controller";

const authRouter = express.Router();
//
authRouter.post("/register", registerMiddleware, registerController);
authRouter.post("/login", loginMiddleware, loginController);
authRouter.post("/logout", accessTokenMiddleware, logoutController); //phải có accessToken (đã login) thì mới được logout nhé

export default authRouter;
