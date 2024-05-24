import express from "express";
import {
  verifyEmailController,
  responseRequestController,
  getMeController,
  getRequestFriendController,
  getUserController,
  requestFriendController,
  updateUserController,
  requestResetPasswordController,
  verifyResetPasswordController,
  validateResetPasswordController,
  resetPasswordController,
  suggestedFriendsController,
  getUserByNameController,
} from "../controller/user.controller.js";
import { accessTokenMiddleware } from "../middlewares/auth.middleware.js";
import { resetPasswordMiddleware } from "../middlewares/user.middleware.js";

const usersRouter = express.Router();

/**
 * Description: Verify email
 * Path: /users/verify/:userId/:token
 * Method: GET
 * Params: { userId: string, token: string }
 * Header: { Authorization: Bearer <access_token> }
 */
usersRouter.get("/verify/:userId/:token", verifyEmailController);

/**
 * Description: Verify email
 * Path: /users/verify/:userId/:token
 * Method: GET
 * Params: { userId: string, token: string }
 * Header: { Authorization: Bearer <access_token> }
 */
usersRouter.get("/search", accessTokenMiddleware, getUserByNameController);

/**
 * Description: Update user
 * Path: /users/update-user
 * Method: POST
 * Body: { firstName: string, lastName: string, location: string, profileUrl: string, profession: string }
 * Header: { Authorization: Bearer <access_token> }
 */
usersRouter.post("/update-user", accessTokenMiddleware, updateUserController);
usersRouter.get("/get-user/:id", getUserController);
usersRouter.get("/me", accessTokenMiddleware, getMeController);

/**
 * route: request-friend
 */
usersRouter.post(
  "/request-friend",
  accessTokenMiddleware,
  requestFriendController
);
/**
 * Description: Get all request friend reviced
 */
usersRouter.get(
  "/get-request-friend",
  accessTokenMiddleware,
  getRequestFriendController
);
/**
 * Description: accept / deny friend request
 */
usersRouter.post(
  "/response-request-friend",
  accessTokenMiddleware,
  responseRequestController
);

// PASSWORD RESET
usersRouter.post(
  "/request-reset-password",
  resetPasswordMiddleware,
  requestResetPasswordController
);

// Để verify xem có vào được trang nhập mã CODE 4 pin hay không
usersRouter.get(
  "/verify-reset-password/:userId",
  verifyResetPasswordController
);

usersRouter.get(
  "/validate-reset-password/:userId/:code",
  validateResetPasswordController
);
usersRouter.post("/reset-password", resetPasswordController);

//suggested friends
usersRouter.get(
  "/suggested-friends",
  accessTokenMiddleware,
  suggestedFriendsController
);

export default usersRouter;
