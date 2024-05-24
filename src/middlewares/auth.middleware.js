import JWT from "jsonwebtoken";
import Users from "../models/User.model";
import _ from "lodash";
import { sendVericationEmail } from "../utils/sendEmail";
import utils from "../utils";

export const accessTokenMiddleware = async (req, res, next) => {
  const authHeader = req?.headers?.authorization;
  console.log("authHeader: ", authHeader);
  if (!authHeader || !authHeader?.startsWith("Bearer")) {
    next(new Error("Authentication failed"));
  }

  const accessToken = authHeader?.split(" ")[1];
  try {
    const { userId } = JWT.verify(accessToken, process.env.JWT_SECRET_KEY);
    if (!userId) {
      next(new Error("AccessToken is not Invalid"));
    }
    req.userId = userId;
    next();
  } catch (error) {
    console.log(error);
    next(new Error("Authentication failed"));
  }
};

export const registerMiddleware = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!(firstName && lastName && email && password)) {
      return next(new Error("Provide required fields !"));
    }
    const userExist = await Users.findOne({ email });
    if (userExist) {
      return next(new Error("Email address already exist !"));
    }
    req.user = { firstName, lastName, email, password };
    //return ben tren de no k nhay vao ben duoi nay nua
    next();
  } catch (error) {
    console.log(error);
    next(new Error("Authentication failed"));
  }
};

export const loginMiddleware = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!(email && password)) {
      return next(new Error("Please Provide User Credentials !"));
    }
    ////////////////////CO 2 CACH DE QUERY KHONG LAY FIELD "password"
    //cach 1:
    // const user = await Users.findOne(
    //   { email },
    //   {
    //     password: 0,
    //   }
    // );
    // Cach 2:
    // const user = await Users.findOne({ email }).select("-password");
    ////////////////////

    const user = await Users.findOne({ email });
    // const user = await Users.findOne({ email }).select("+password").populate({
    //   path: "friends",
    //   select: "firstName lastName location profileUrl -password",
    // });
    if (!user) {
      return next(new Error("Invalid email or password !"));
    }
    if (user?.verified === "false") {
      await sendVericationEmail(user, res, next);
      return next(
        new Error(
          "User email is not verified. Check your email account and verify your email"
        )
      );
    }

    const isMatch = await utils.compareString(password, user?.password);

    if (!isMatch) {
      next(new Error("Invalid email or password"));
      return;
    }

    req.user = user;
    next();
    // res.status(200).send(user);
  } catch (error) {
    console.log(error);
    res.status(404).send({ message: error.message });
  }
};
