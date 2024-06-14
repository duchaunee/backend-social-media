import mongoose, { mongo } from "mongoose";
import Verification from "../models/EmailVerification.model.js";
import FriendRequest from "../models/FriendRequest.model.js";
import Users from "../models/User.model.js";
import utils from "../utils/index.js";
import PasswordReset from "../models/PasswordReset.model.js";
import { resetPasswordLink, sendVericationEmail } from "../utils/sendEmail.js";
import { ObjectId } from "mongodb";

export const getUserController = async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new Error("Invalid ID"));
  }
  const user = await Users.findOne({ _id: id }).select("-password");
  if (user === null) {
    console.log("User not found");
    //--> di ve next Error handling Middleware
    return next(new Error("User not found"));
  }
  return res.json({
    message: "Get profile successfully !",
    result: user,
  });
};

export const updateUserController = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      location,
      profileUrl,
      profession,
      description,
    } = req.body;

    if (
      !(
        firstName ||
        lastName ||
        location ||
        profileUrl ||
        profession ||
        description
      )
    ) {
      return next(new Error("Please provide required fields !"));
    }
    const { userId } = req;
    console.log("userId: ", userId);

    const updateUser = {
      firstName: firstName?.trim(),
      lastName: lastName?.trim(),
      location: location?.trim(),
      profileUrl: profileUrl?.trim(),
      profession: profession,
      description: description?.trim(),
    };
    console.log("updateUser: ", updateUser);
    const user = await Users.findByIdAndUpdate(userId, updateUser, {
      new: true,
    });
    // await user.populate({ path: "friends", select: "-password" });
    user.password = undefined;

    res.status(200).json({
      sucess: true,
      message: "Update user successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    next(new Error("Authentication failed"));
  }
};

export const getMeController = async (req, res, next) => {
  try {
    const { userId } = req;
    const user = await Users.findById(userId).select(
      "-password -createdAt -updatedAt -verified"
    );
    res.status(200).json({
      sucess: true,
      message: "Get me successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    next(new Error("Get me Failed"));
  }
};

export const requestFriendController = async (req, res, next) => {
  try {
    const { userId } = req;
    const { requestTo } = req.body;

    //check if requestTo is not ObjectId
    if (!mongoose.Types.ObjectId.isValid(requestTo)) {
      return next(new Error("Invalid Object ID"));
    }

    //if requestTo is ObjectId, check if friend is not exist
    const friend = await Users.findOne({
      _id: new mongoose.Types.ObjectId(requestTo),
    });
    if (!friend) {
      return next(new Error("Send request to non-existing user"));
    }

    //check if user sent 1 request add friend to `requestTo`
    const requestExist = await FriendRequest.findOne({
      requestFrom: userId,
      requestTo,
    });

    if (requestExist) {
      next(new Error("Friend Request already sent."));
      return;
    }
    //check if user recived 1 request add friend from `requestTo`
    const accountExist = await FriendRequest.findOne({
      requestFrom: requestTo,
      requestTo: userId,
    });

    if (accountExist) {
      next("Friend Request already reviced.");
      return;
    }

    const newRes = await FriendRequest.create({
      requestFrom: userId,
      requestTo,
    });
    res.status(200).json({
      sucess: true,
      message: "Request Friend sent successfilly !",
    });
  } catch (error) {
    console.log(error);
    next(new Error("Request Friend Failed"));
  }
};

export const getRequestFriendController = async (req, res, next) => {
  try {
    const { limit } = req.query;
    const { userId } = req;

    const allRequestRecived = await FriendRequest.find({
      requestTo: userId,
      requestStatus: "Pending",
    })
      .populate({
        path: "requestFrom",
        select: "firstName lastName profileUrl profession -password",
      })
      .limit(limit || 3)
      .sort({
        _id: -1,
      });

    res.status(200).json({
      sucess: true,
      data: allRequestRecived,
    });
  } catch (error) {
    console.log(error);
    next(new Error("Request Friend Failed"));
  }
};

export const undoRequestController = async (req, res, next) => {
  try {
    const { userId } = req;

    const { requestTo } = req.body;

    if (!requestTo) {
      return next(new Error("requestTo is required !"));
    }

    const requestExist = await FriendRequest.findOne({
      $and: [{ requestFrom: userId }, { requestTo }],
    });

    if (!requestExist) {
      next(new Error("No friend requests were sent."));
      return;
    }
    const removeRequestFriend = await FriendRequest.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(requestExist._id),
    });

    res.status(201).json({
      success: true,
      message: "Undo Request Success !",
    });
  } catch (error) {
    console.log(error);
    next(new Error("Undo Friend Failed"));
  }
};

export const responseRequestController = async (req, res, next) => {
  try {
    const { userId } = req;

    const { rid, status } = req.body;

    if (!(rid && status)) {
      return next(new Error("rid & status is required !"));
    }
    console.log(
      "=ASDJASIDJAOSJDOASJDADJOAJASDJASIDJAOSJDOASJDADJOAJASDJASIDJAOSJDOASJDADJOAJASDJASIDJAOSJDOASJDADJOAJ"
    );

    const requestExist = await FriendRequest.findById(rid);

    if (!requestExist) {
      next(new Error("No Friend Request Found."));
      return;
    }

    const newRes = await FriendRequest.findByIdAndUpdate(
      { _id: rid },
      { requestStatus: status }
    );

    if (status === "accept") {
      const user = await Users.findById(userId);
      console.log("user.friends: ", user.friends);
      user.friends.push(newRes?.requestFrom);

      await user.save();

      const friend = await Users.findById(newRes?.requestFrom);

      friend.friends.push(newRes?.requestTo);

      await friend.save();

      //delete
      const removeRequestFriend = await FriendRequest.deleteOne({
        requestFrom: newRes?.requestFrom,
      });

      res.status(201).json({
        success: true,
        message: "Friend Request " + status,
      });
      ////////////////////////////////
    } else if (status === "deny") {
      const removeRequestFriend = await FriendRequest.deleteOne({
        requestFrom: newRes?.requestFrom,
      });
      res.status(201).json({
        success: true,
        message: "Friend Request " + status,
      });
    } else {
      next(new Error("Please provide a valid status field (accept/deny)"));
    }
  } catch (error) {
    console.log(error);
    next(new Error("Request Friend Failed"));
  }
};

export const requestResetPasswordController = async (req, res, next) => {
  try {
    const { email } = req.email;

    const user = await Users.findOne({
      email,
    }).select("-password");

    if (!user) {
      return next(new Error("Email does not exist !"));
    }
    if (user.verified === "false") {
      await sendVericationEmail(user, res, next);
      return next(
        new Error("User is not verified, pls check mail to verify !")
      );
    }
    // user.password = undefined;
    // res.send(user);

    //MỞ CÁI NÀY RA, VỪA TẮT LÚC 7:06 TRÁNH SEND MAIL NHIỀU QUÁ
    await resetPasswordLink(user, res, next);
  } catch (error) {
    console.log(error);
    next(new Error(error.message));
  }
};

export const verifyResetPasswordController = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const pwReset = await PasswordReset.findOne({ userId });

    if (!pwReset) {
      return next(new Error("Invalid reset password reset link. Try again"));
    }
    if (pwReset.expiresAt < Date.now()) {
      await PasswordReset.findOneAndDelete({ _id: new ObjectId(pwReset._id) });
      return next(new Error("Reset password expired link. Try again"));
    }

    return res.status(200).send({
      status: "OK",
      message: "Access Reset Password acpect !",
    });
  } catch (error) {
    console.log(error);
    next(new Error(error.message));
  }
};

export const validateResetPasswordController = async (req, res, next) => {
  try {
    const { userId, code } = req.params;
    const user = await Users.findById(userId);

    if (!user) {
      next(new Error("Invalid password reset link. Try again"));
      return;
    }

    const resetPassword = await PasswordReset.findOne({ userId });

    if (!resetPassword) {
      next(new Error("Invalid password reset link. Try again"));
      return;
    }

    const { expiresAt, code: codeInDb } = resetPassword;

    if (expiresAt < Date.now()) {
      await PasswordReset.findOneAndDelete({ code });
      return next(
        new Error("Reset Password link has expired. Please try again")
      );
    } else {
      const isMatch = code === codeInDb;
      // console.log("codeInDb: ", codeInDb);
      // console.log("code: ", code);

      if (!isMatch) {
        next(
          new Error(
            "The number that you've entered doesn't match your code. Please try again."
          )
        );
        return;
      } else {
        return res.status(200).send({
          status: "OK",
          message: "Verified ResetPassword successfully",
        });
      }
    }
  } catch (error) {
    console.log(error);
    next(new Error(error.message));
  }
};

export const resetPasswordController = async (req, res, next) => {
  try {
    const { userId, code, newPassword } = req.body;
    const user = await Users.findById(userId);

    if (!user) {
      next(new Error("Invalid password reset link. Try again 1"));
      return;
    }

    const resetPassword = await PasswordReset.findOne({ userId });

    if (!resetPassword) {
      next(new Error("Invalid password reset link. Try again 2"));
      return;
    }

    const { expiresAt, code: codeInDb } = resetPassword;

    if (expiresAt < Date.now()) {
      await PasswordReset.findOneAndDelete({ code });
      return next(
        new Error("Reset Password link has expired. Please try again")
      );
    } else {
      const isMatch = code === codeInDb;
      if (!isMatch) {
        next(new Error("Invalid reset password link. Please try again 3"));
        return;
      }
      user.password = await utils.hashString(newPassword);
      // user.password = newPassword;
      // console.log("new user: ", user);
      await user.save();
      await PasswordReset.findOneAndDelete({ code });

      return res.status(200).send({
        status: "OK",
        message: "Reset Password successfully",
      });
    }
  } catch (error) {
    console.log(error);
    next(new Error(error.message));
  }
};

export const changePasswordController = async (req, res, next) => {
  try {
    const { userId } = req;
    const { current_password, new_password, confirm_password } = req.body;

    const user = await Users.findById(userId);

    if (!user) {
      next(new Error("User is not exist. Try again !"));
      return;
    }

    const isMatchConfirmPw = new_password === confirm_password;
    if (!isMatchConfirmPw) {
      next(new Error("Confirm passwords do no match !"));
      return;
    }

    const isMatch = await utils.compareString(current_password, user?.password);
    if (!isMatch) {
      next(new Error("Incorrect password"));
      return;
    }

    user.password = await utils.hashString(new_password);
    await user.save();

    return res.status(200).send({
      status: "OK",
      message: "Change Password successfully",
    });
  } catch (error) {
    console.log(error);
    next(new Error(error.message));
  }
};

export const friendSentController = async (req, res, next) => {
  try {
    const { userId } = req;

    const user = await Users.findById(userId);
    if (!user) {
      return next(new Error("User is not exist. Try again !"));
    }

    const allFriendSent = await FriendRequest.find({
      requestFrom: userId,
    }).populate({
      path: "requestTo",
      select: "firstName lastName friends profileUrl profession -password",
    });

    if (!allFriendSent) {
      return next(new Error("Friend Sent is not exist. Try again !"));
    }

    res.status(200).json({
      success: true,
      length: allFriendSent.length,
      message: "Get all friend sent sussessfully !",
      data: allFriendSent,
    });
  } catch (error) {
    next(new Error(error.message));
  }
};

export const suggestedFriendsController = async (req, res, next) => {
  try {
    const { limit } = req.query;
    const { userId } = req;

    let queryObject = {};
    //loại bỏ chính nó
    queryObject._id = { $ne: userId };
    //lọc ra các user mà field friends không có userId (tức là suggest friend thì không gợi ý những người đã thành friend với user)
    queryObject.friends = { $nin: userId };

    const [suggestedFriends, friendRequests] = await Promise.all([
      Users.find(queryObject)
        .limit(limit || 5)
        .select("firstName lastName profileUrl friends -password"),
      FriendRequest.find({
        $or: [{ requestFrom: userId }, { requestTo: userId }],
      }),
    ]);

    const filteredSuggestions = suggestedFriends.filter((user) => {
      // tìm trong friendRequests xem userId có gửi lời mời kết bạn cho đối phương không hay đối phương có gửi lời mời kết bạn cho userId không, NẾU CÓ THÌ LOẠI BỎ K TRẢ VỀ SuggestFriend
      const hasFriendRequest = friendRequests.some((request) => {
        return (
          request.requestFrom.toString() === user._id.toString() ||
          request.requestTo.toString() === user._id.toString()
        );
      });
      return !hasFriendRequest;
    });

    // const suggestedFriends = await Users.find(queryObject)
    //   .limit(limit || 5)
    //   .select("firstName lastName profileUrl friends -password");

    res.status(200).json({
      success: true,
      data: filteredSuggestions,
    });
  } catch (error) {
    next(new Error(error.message));
  }
};

export const allFriendsController = async (req, res, next) => {
  try {
    const { userId } = req;
    const user = await Users.findById(userId).populate({
      path: "friends",
      select: "_id firstName lastName profileUrl friends location -password",
    });

    if (!user) {
      return next(new Error("User is not exist. Try again !"));
    }
    const allFriend = user.friends;

    res.status(200).json({
      success: true,
      length: allFriend.length,
      data: allFriend,
    });
  } catch (error) {
    next(new Error(error.message));
  }
};

export const unfriendController = async (req, res, next) => {
  try {
    const { userId } = req;
    const { friend_id } = req.body;

    const [user, friend] = await Promise.all([
      Users.findById(userId),
      Users.findById(friend_id),
    ]);

    if (!user) {
      return next(new Error("User is not exist. Try again !"));
    }
    if (!friend) {
      return next(new Error("Friend is not exist. Try again !"));
    }

    user.friends = user.friends.filter((f_id) => f_id.toString() !== friend_id);
    friend.friends = friend.friends.filter((id) => id.toString() !== userId);

    Promise.all([user.save(), friend.save()]);

    res.status(200).json({
      success: true,
      message: "Unfriend successfully !",
    });
  } catch (error) {
    next(new Error(error.message));
  }
};

export const relationshipController = async (req, res, next) => {
  try {
    const { userId } = req;
    const { friend_id } = req.body;

    const [user, friend] = await Promise.all([
      Users.findById(userId),
      Users.findById(friend_id),
    ]);

    if (!user) {
      return next(new Error("User is not exist. Try again !"));
    }
    if (!friend) {
      return next(new Error("Friend is not exist. Try again !"));
    }
    /**
     * status_friend: Đang là bạn
     * status_sent: Đã gửi cho friend 1 lời mời kết bạn
     * status_received: Đã nhận từ friend 1 lời mời kết bạn
     * suggestions: Người lạ
     */
    const status_friend = user.friends.some(
      (f_id) => f_id.toString() === friend_id
    );
    const [status_sent, status_received] = await Promise.all([
      FriendRequest.find({
        requestFrom: userId,
        requestTo: friend_id,
      }),
      FriendRequest.find({
        requestFrom: friend_id,
        requestTo: userId,
      }),
    ]);

    let relationship = {};
    if (status_friend) {
      relationship.status = "friend";
    } else if (status_sent.length > 0) {
      relationship.status = "sent";
    } else if (status_received.length > 0) {
      relationship.rid = status_received[0]._id;
      relationship.status = "received";
    } else {
      relationship.status = "suggestions";
    }

    res.status(200).json({
      success: true,
      relationship,
      message: "Get relationship successfully !",
    });
  } catch (error) {
    next(new Error(error.message));
  }
};

export const verifyEmailController = async (req, res, next) => {
  const { userId, token } = req.params;
  //khi ng dung dang ky thi tao 1 Verification
  const result = await Verification.findOne({ userId });
  if (!result) {
    //neu user tu y nhap link nhung sai userID/token
    // res.redirect("http://localhost:3000/redirect/");
    // res.redirect(`/users/verified?status=error&message=${message}`);
    return next(new Error("Invalid verification link. Try again later."));
  }

  const { expiresAt, token: token_in_db } = result;

  // token has expires
  if (expiresAt < Date.now()) {
    try {
      await Promise.all([
        Verification.findOneAndDelete({ userId }),
        Users.findOneAndDelete({ _id: userId }),
      ]);
      return next(new Error("Verification token has expired."));
      // res.redirect(`/users/verified?status=error&message=${message}`);
    } catch (error) {
      console.log(error);
      // res.redirect(`/users/verified?message=`);
    }
  } else {
    //token valid
    const isMatch = await utils.compareString(token, token_in_db);
    if (isMatch) {
      try {
        await Promise.all([
          Users.findOneAndUpdate({ _id: userId }, { verified: true }),
          Verification.findOneAndDelete({ userId }),
        ]);
        return res.status(200).send({
          status: "OK",
          message: "Email verified successfully",
        });
        // res.redirect(`/users/verified?status=success&message=${message}`);
      } catch (err) {
        return next(new Error("Verification failed or link is invalid"));
        // res.redirect(`/users/verified?status=error&message=${message}`);
      }
    } else {
      // invalid token
      const message = "Verification failed or link is invalid";
      // res.redirect(`/users/verified?status=error&message=${message}`);
    }
  }
};

export const getUserByNameController = async (req, res, next) => {
  try {
    const { userId } = req;
    const { key } = req.query;
    if (!key) return next(new Error("Key is not invalid"));

    const data = await Users.find({
      _id: { $ne: userId }, // tim kiem k bao gom chinh' user
      $or: [
        { firstName: { $regex: key, $options: "i" } },
        { lastName: { $regex: key, $options: "i" } },
      ],
    })
      .select("firstName lastName location profileUrl -password")
      .exec();

    res.status(200).send({
      status: "OK",
      data,
    });
  } catch (error) {
    next(new Error(error.message));
  }
};
