const emailValidator = require("deep-email-validator");
const { validationResult } = require("express-validator");
const cryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const User = require("../models/User");
const Password = require("../models/Password");

const register = async (req, res, next) => {
  const { email, name, masterPassword } = req.body;
  try {
    const { valid } = await emailValidator.validate(email);

    if (valid) {
      console.log("Valid Email...");

      const errors = validationResult(req);

      const fetchedUser = await User.findOne({ email });

      if (fetchedUser) {
        console.log("Already Registered User!!!");
        res.status(409).json({
          message: "user already exist!!!",
          data: null,
        });
      } else {
        console.log("new User!!!");
        const user = new User({
          name,
          email,
          masterPassword: cryptoJS.AES.encrypt(
            masterPassword,
            process.env.SECRET_MASTER_PASSWORD
          ).toString(),
        });
        await user.save();
        res.status(201).json({
          message: "user created successfully!!!",
          data: user,
        });
      }
    } else {
      res.status(513).json({
        status: 513,
        message: "inValid Email",
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
    console.log(err.message);
  }
};

const login = async (req, res, next) => {
  const { email, masterPassword } = req.body;
  try {
    const errors = validationResult(req);

    const { valid } = await emailValidator.validate(email);
    if (valid) {
      const fetchedUser = await User.findOne({ email: email });
      if (!fetchedUser) {
        res.status(404).json({
          status: 404,
          message: "User not Found!!!",
        });
      }
      const bytes = cryptoJS.AES.decrypt(
        fetchedUser.masterPassword,
        process.env.SECRET_MASTER_PASSWORD
      );
      const hashedPassword = bytes.toString(cryptoJS.enc.Utf8);
      console.log(hashedPassword);
      if (hashedPassword === masterPassword) {
        //user authenticated!!!
        const accessToken = jwt.sign(
          { id: fetchedUser._id, email: fetchedUser.email },
          process.env.JWT_TOKEN,
          {
            expiresIn: "5d",
          }
        );

        res.cookie("accessToken", accessToken, {
          expires: new Date("1 jan 2023"),
          httpOnly: true,
        });

        const { masterPassword, ...otherData } = fetchedUser._doc;
        res.status(200).json({
          status: 200,
          message: "success",
          data: otherData,
          token: accessToken
        });
      }
    } else {
      res.status(513).json({
        status: 513,
        message: "invalid Email",
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
    console.log(err.message);
  }
};

const logOut = async (req, res, next) => {
  try {
    console.log("logout function!!!");
    res.clearCookie("accessToken");
    res.status(200).json({
      message: "logout successfully!!!",
      success: true,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
    console.log(err.message);
  }
};

const updateUser = async (req, res, next) => {
  // const { name, masterPassword } = req.body;
  try {
    console.log(req.body);
    const fetchedUser = await User.findById(req.user.id);

    const updateUser = {
      name: req.body.name === undefined ? fetchedUser.name : req.body.name,
      masterPassword:
        req.body.masterPassword === undefined
          ? fetchedUser.masterPassword
          : cryptoJS.AES.encrypt(
              req.body.masterPassword,
              process.env.SECRET_MASTER_PASSWORD
            ),
    };

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updateUser, {
      new: true,
    });
    const { masterPassword, ...otherData } = updatedUser._doc;
    res.status(200).json({
      status: 200,
      message: "user successfully updated!!!",
      data: otherData,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
    console.log(err.message);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const fetchedUser = await User.findById(req.user.id);
    if (fetchedUser.webPasswords.length !== 0) {
      await Password.deleteMany({
        _id: {
          $in: fetchedUser.webPasswords,
        },
      });
    }
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({
      status: 200,
      message: "User has been successfully deleted!!!",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
    console.log(err.message);
  }
};

module.exports = {
  register,
  login,
  updateUser,
  deleteUser,
  logOut,
};
