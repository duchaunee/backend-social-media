import Utils from "../utils/index.js";
import Users from "../models/User.model.js";
import { sendVericationEmail } from "../utils/sendEmail.js";

export const registerController = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.user;
    const hashedPassword = await Utils.hashString(password);

    const user = await Users.create({
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: hashedPassword,
      profileUrl: process.env.DEFAULT_AVATAR, //default-avatar
    });

    // res.status(200).send(user);
    await sendVericationEmail(user, res, next);
    //
  } catch (error) {
    console.log("error: ", error);
    res.status(404).json({ message: error.message });
  }
};

export const loginController = async (req, res, next) => {
  const { user } = req;
  try {
    console.log("Cookies: ", req.cookies);
    /**
     *  Khi 1 key có value là undefined thì object đó sẽ không có key/value đó
     * NHƯNG NÓ VẪN TỒN TẠI trong object đó
     */
    user.password = undefined;

    //sau xu lt them refreshToken sau
    const accessToken = Utils.createJWT(user._id, "1d");
    console.log("accessToken: ", accessToken);

    res
      // .cookie("cookie-server", "123", {
      //   // httpOnly: true,
      //   sameSite: "none",
      //   secure: true,
      // })
      .status(201)
      .json({
        success: true,
        message: "Login successfully",
        user,
        accessToken,
      });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const logoutController = async (req, res, next) => {
  try {
    res.status(201).json({
      status: "OK",
      message: "Logout successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};
