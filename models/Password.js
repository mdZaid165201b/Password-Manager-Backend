const mongoose = require("mongoose");

const PasswordSchema = mongoose.Schema({
  webName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  masterPassReq: {
    type: Boolean,
    default: true,
  },
});
module.exports = mongoose.model("Password", PasswordSchema);
