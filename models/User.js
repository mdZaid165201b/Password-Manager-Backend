const mongoose = require("mongoose");

const UserSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    masterPassword: {
      type: String,
      required: true,
    },
    profilePic: {
      type: String,
    //   required: true,
    },
    webPasswords: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Password",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
