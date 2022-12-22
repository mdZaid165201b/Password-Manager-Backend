const cryptoJS = require("crypto-js");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const Password = require("../models/Password");

const createPassword = async (req, res, next) => {
  try {
    if (!validationResult(req).isEmpty()) {
      res.status(400).json({
        message: validationResult(req).array()[0].msg,
        success: false,
      });
    }
    const fetchedUser = await User.findOne({ email: req.user.email }).select({
      masterPassword: 0,
    });
    if (!fetchedUser) {
      res.status(404).json({
        message: "user must be loged In!!!",
        success: false,
      });
    } else {
      const passwordObj = new Password({
        webName: req.body.title,
        password: cryptoJS.AES.encrypt(
          cryptoJS.AES.encrypt(
            req.body.password,
            process.env.SECRET_APP_PASSWORD
          ).toString(),
          process.env.SECRET_APP_PASSWORD
        ),
        userID: fetchedUser,
      });

      await User.findByIdAndUpdate(
        { _id: fetchedUser._id },
        {
          $push: { webPasswords: passwordObj },
        }
      );
      await passwordObj.save();
      const { password, userID, ...otherData } = passwordObj._doc;
      console.log(otherData);
      res.status(201).json({
        message: "password created successfully!!!",
        success: true,
        password: otherData,
      });
    }
  } catch (err) {
    res.status(500).json({
      message: err.message,
      status: 500,
      success: false,
    });
  }
};

const updatePassword = async (req, res, next) => {
  const { masterPassword, password, name } = req.body;
  const { id } = req.params;

  try {
    const fetchedUser = await User.findById(req.user.id);
    const masterBytes = cryptoJS.AES.decrypt(
      fetchedUser.masterPassword,
      process.env.SECRET_MASTER_PASSWORD
    );
    const decryptHashed = masterBytes.toString(cryptoJS.enc.Utf8);
    if (decryptHashed === masterPassword) {
      console.log("user have same master password");

      const hasedPassword = cryptoJS.AES.encrypt(
        cryptoJS.AES.encrypt(
          password,
          process.env.SECRET_APP_PASSWORD
        ).toString(),
        process.env.SECRET_APP_PASSWORD
      ).toString();
      const fetchedPasswordObj = await Password.findById(id);
      await Password.findByIdAndUpdate(
        id,
        {
          $set: {
            password: hasedPassword,
            webName: name === undefined ? fetchedPasswordObj.webName : name,
          },
        },
        { new: true }
      );

      res.status(200).json({
        message: "Password Successfully Updated!!!",
        success: true,
      });
    } else {
      res.status(404).json({
        message: "Wrong Master Password",
        success: false,
      });
    }
  } catch (err) {
    res.status(500).json({
      message: err.message,
      success: false,
    });
  }
};

const deletePassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { masterPassword } = req.body;

    const fetchedUser = await User.findById(req.user.id);

    const bytes = cryptoJS.AES.decrypt(
      fetchedUser.masterPassword,
      process.env.SECRET_MASTER_PASSWORD
    );

    const decryptedHashed = bytes.toString(cryptoJS.enc.Utf8);
    if (decryptedHashed === masterPassword) {
      const fetchedPassword = await Password.findById(id);

      if (fetchedPassword) {
        await User.findByIdAndUpdate(
          { _id: req.user.id },
          { $pull: { webPasswords: fetchedPassword._id } }
        );

        await Password.findByIdAndDelete(id);
        res.status(200).json({
          message: "Successfully Deleted!!!",
          success: true,
        });
      } else {
        res.status(404).json({
          msessage: "Invalid ID",
          success: false,
        });
      }
    } else {
      res.status(404).json({
        message: "Invalid Master Password!!!",
        success: false,
      });
    }
  } catch (err) {
    res.status(500).json({
      message: err.message,
      success: false,
    });
  }
};

const getPasswords = async (req, res, next) => {
  const { id } = req.user;
  try {
    const passwords = await User.findById(id)
      .populate("webPasswords")
      .select({ userID: 0 });

    const updatedPassword = [];
    passwords.webPasswords.forEach((obj) => {
      const { password, ...otherData } = obj._doc;
      updatedPassword.push(otherData);
    });
    res.status(200).json({
      userID: id,
      success: true,
      updatedPassword,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
      success: false,
    });
  }
};

const getPassword = async (req, res, next) => {
  const { masterPassword } = req.body;
  const { id } = req.params;
  try {
    const fetchedUser = await User.findById(req.user.id);
    const masterBytes = cryptoJS.AES.decrypt(
      fetchedUser.masterPassword,
      process.env.SECRET_MASTER_PASSWORD
    );
    const fetchedPassword = await Password.findById(id);
    const masterHashedDecrypted = masterBytes.toString(cryptoJS.enc.Utf8);
    if (masterHashedDecrypted === masterPassword) {
      if (fetchedPassword) {
        const fetchedPasswordObj = await Password.findById(id);
        const pBytes1 = cryptoJS.AES.decrypt(
          fetchedPasswordObj.password,
          process.env.SECRET_APP_PASSWORD
        );
        const hash1 = pBytes1.toString(cryptoJS.enc.Utf8);
        const pBytes2 = cryptoJS.AES.decrypt(
          hash1,
          process.env.SECRET_APP_PASSWORD
        );
        const decryptedPassword = pBytes2.toString(cryptoJS.enc.Utf8);

        console.log(decryptedPassword);
        res.status(200).json({
          message: `${id} Password`,
          success: true,
          password: decryptedPassword,
        });
        
      } else {
        res.status(404).json({
          message: "Invalid ID!!!",
          success: false,
        });
      }
    } else {
      res.status(404).json({
        message: "Invalid Master Password!!!",
        success: false,
      });
    }
  } catch (err) {
    res.status(500).json({
      message: err.message,
      success: false,
    });
  }
};

module.exports = {
  createPassword,
  getPasswords,
  updatePassword,
  deletePassword,
  getPassword,
};
