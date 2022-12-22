const { Router } = require("express");
const router = Router();
const { body, validationResult } = require("express-validator");
const verifyUser = require("../middleware/verifyToken");
const {
  createPassword,
  getPasswords,
  updatePassword,
  deletePassword,
  getPassword
} = require("../controller/passwordController");

router.post(
  "/create",
  verifyUser,
  body("title").notEmpty(),
  body("password").isLength({ min: 12 }),
  createPassword
);

router.get("/getPasswords", verifyUser, getPasswords);

router.put("/update/:id", verifyUser, updatePassword);

router.delete("/delete/:id", verifyUser, deletePassword);

router.get("/getPassword/:id", verifyUser, getPassword)


module.exports = router;
