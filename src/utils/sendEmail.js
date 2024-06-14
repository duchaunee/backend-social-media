import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import utils from "./index.js";
import Verification from "../models/EmailVerification.model.js";
import PasswordReset from "../models/PasswordReset.model.js";

dotenv.config();
const { REACT_URL, AUTH_EMAIL, AUTH_PASSWORD, APP_URL } = process.env;
console.log("{ REACT_URL, AUTH_EMAIL, AUTH_PASSWORD, APP_URL } : ", {
  REACT_URL,
  AUTH_EMAIL,
  AUTH_PASSWORD,
  APP_URL,
});
// console.log({
//   user: AUTH_EMAIL,
//   pass: AUTH_PASSWORD,
// });

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  service: "gmail",
  port: 587,
  secure: false,
  auth: {
    user: AUTH_EMAIL,
    pass: AUTH_PASSWORD,
  },
});

export const sendVericationEmail = async (user, res, next) => {
  const { _id, email, lastName } = user;
  // console.log("user: ", user);
  const token = _id + uuidv4();
  const link = REACT_URL + "verify/" + _id + "/" + token + "?email=" + email;
  console.log("link: ", link);

  const mailOptions = {
    from: AUTH_EMAIL,
    to: email,
    subject: "Email verification",
    text: "Thanks for contacing us",
    html: utils.templateSendVericationEmail(lastName, link),
  };

  try {
    const hasdedToken = await utils.hashString(token);
    //
    const existVerify = await Verification.findOne({
      userId: _id,
    });

    let newVerifiedEmail;

    //nếu có tồn tại --> update lại createAt, expiresAt và gửi lại mail thôi
    if (existVerify) {
      newVerifiedEmail = await Verification.findByIdAndUpdate(existVerify._id, {
        token: hasdedToken,
        createAt: Date.now(),
        expiresAt: Date.now() + 3600000, //1 gio
      });
    } else {
      newVerifiedEmail = await Verification.create({
        userId: _id,
        token: hasdedToken,
        createAt: Date.now(),
        expiresAt: Date.now() + 3600000, //1 gio
      });
    }

    if (newVerifiedEmail) {
      await transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          return next(new Error(error.message));
        } else {
          res.status(201).send({
            success: "PENDING",
            message:
              "Verification email has been sent to your account. Check your email !",
          });
          console.log("Email sent: " + info.response);
        }
      });
    }
  } catch (error) {
    console.log(error);
    res.status(404).send({ message: error.message });
  }
};

export const resetPasswordLink = async (user, res, next) => {
  const { _id, email, lastName } = user;
  let resetPassword; //ket qua tra ve khi create/update/

  //ham nay de gui lai email voi code cu neu da ton tai require reset password + expired van con`
  const sendEmailResetPassword = async (code) => {
    const link = REACT_URL + "reset-password/" + _id + "/" + code;
    console.log("link: ", link);

    const mailOptions = {
      from: AUTH_EMAIL,
      to: email,
      subject: "Reset Password",
      text: "Thanks for contacing us",
      html: utils.templateSendResetPassword(lastName, code, link),
    };
    await transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        return next(new Error(error.message));
      } else {
        res.status(201).send({
          success: "PENDING",
          userId: _id,
          message: "Reset Password Link has been sent to your email.",
        });
        console.log("Email sent: " + info.response);
      }
    });
  };

  try {
    const existPasswordReset = await PasswordReset.findOne({
      userId: _id,
      email: email,
    });
    // console.log("existPasswordReset: ", existPasswordReset);

    /**
     * NẾU CHƯA GỬI MAIL LẦN NÀO THÌ CHỈ CẦN CREATE RỒI GỬI THÔI
     */
    if (!existPasswordReset) {
      const code = utils.createCodeResetPassword();
      resetPassword = await PasswordReset.create({
        userId: _id,
        email: email,
        code,
        createdAt: Date.now(),
        expiresAt: Date.now() + 600000,
      });
      if (resetPassword) sendEmailResetPassword(code);
      return;
    }

    /**
     * NẾU ĐÃ GỬI EMAIL RỒI THÌ XẢY RA 2 THÌ
     * 1. LÀ ĐÃ GỬI RỒI VÀ expiredAt VẪN CÒN HẠN THÌ CHỈ CẦN GỬI LẠI MAIL VỚI CODE CŨ LÀ ĐƯỢC
     * 2. LÀ ĐÃ GỬI RỒI NHƯNG expiredAt ĐÃ HẾT HẠN --> TẠO CODE MỚI + UPDATE VÀ GỬI
     */
    const { expiresAt, code: old_code } = existPasswordReset;

    //TH1: Nếu đã gửi mail reset password 1 lần trước đó rồi và vẫn còn hạn thì gửi lại code cũ là đc :V
    if (existPasswordReset && expiresAt > Date.now()) {
      sendEmailResetPassword(old_code);
      return;
    }

    //TH2: Nếu đã gửi mail reset password 1 lần trước đó rồi nhưng đã hết hạn thì gửi lại với code mới
    if (existPasswordReset && expiresAt <= Date.now()) {
      const new_code = utils.createCodeResetPassword();

      resetPassword = await PasswordReset.findByIdAndUpdate(
        existPasswordReset._id,
        {
          code: new_code,
          createdAt: Date.now(),
          expiresAt: Date.now() + 600000,
        }
      );
      if (resetPassword) sendEmailResetPassword(new_code);
      return;
    }
    //
  } catch (error) {
    console.log(error);
    next(new Error(error.message));
  }
};
