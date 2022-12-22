const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const verifyUser = require("../middleware/verifyToken");

const {
  register,
  login,
  logOut,
  updateUser,
  deleteUser,
} = require("../controller/authController");

router.post(
  "/register",
  body("email").isEmail(),
  body("masterPassword").isLength({ min: 12 }),
  register
);

router.get(
  "/login",
  body("email").isEmail(),
  body("masterPassword").isLength({ min: 12 }),
  login
);

router.get("/user/logout", verifyUser, logOut);

router.put("/update/:id", body("name").notEmpty(), verifyUser, updateUser);

router.delete("/delete/:id", verifyUser, deleteUser);

module.exports = router;
