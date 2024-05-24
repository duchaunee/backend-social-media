import mongoose, { Schema } from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      require: [true, "first name is required "],
    },
    lastName: {
      type: String,
      require: [true, "last name is required "],
    },
    email: {
      type: String,
      require: [true, "ename is required "],
      unique: true,
    },
    password: {
      type: String,
      require: [true, "password is required "],
      minLength: [6, "password length should be greater than 6 character"],
      select: true,
    },
    location: { type: String },
    profileUrl: { type: String },
    profession: [{ type: String }],
    description: { type: String },
    friends: [{ type: Schema.Types.ObjectId, ref: "Users" }],
    views: [{ type: String }],
    verified: { type: String, default: false },
  },
  { timestamps: true }
);

const Users = mongoose.model("Users", userSchema);

export default Users;
