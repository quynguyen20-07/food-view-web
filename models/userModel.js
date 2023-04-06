const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
      trim: true,
      maxlength: 25,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      maxlength: 25,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      maxlength: 25,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default:
        "https://github.com/quygcd18687/images/blob/master/user.png?raw=true",
    },
    role: {
      type: String,
      default: "user",
    },
    gender: {
      type: String,
      default: "male",
    },
    number: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      default: "user",
      maxlength: 200,
    },
    website: {
      type: String,
      default: "",
    },
    followers: [
      {
        type: mongoose.Types.ObjectId,
        ref: "user",
      },
    ],
    following: [
      {
        type: mongoose.Types.ObjectId,
        ref: "user",
      },
    ],
    savedPost: [{type: mongoose.Types.ObjectId, ref: 'user'}]
  },
  { timestamps: true }
);
module.exports = mongoose.model("user", userSchema);
