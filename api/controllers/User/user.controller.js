const mongoose = require("mongoose");
const UserDB = require("../../models/User/user.model");
const statusCode = require("../../helper/statusCode");
const messages = require("../../helper/messages");
const Helper = require("../../helper/index");
const AsymmetricEncrypt = require("../../helper/encryptDecrypt");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("../../../config");
const { USERROLE } = require("../../helper/enums");
const UserAuthLog = require("../../models/User/Log/UserAuthLogModel");

const UserController = {};

UserController.signup = async (req, res) => {
  const { userName, userEmail, userPassword } = req.body;

  try {
    const nameExists = await UserDB.findOne({
      userName,
    }).lean();
    if (nameExists) {
      return res.status(statusCode.Conflict).json({
        message: messages.UserExists,
      });
    }

    const emailExists = await UserDB.findOne({
      userEmail,
    }).lean();
    if (emailExists) {
      return res.status(statusCode.Conflict).json({
        message: messages.emailExists,
      });
    }

    const userObject = {
      flag: 1,
      type: USERROLE.defult,
    };

    userObject.userName = userName;
    userObject.userEmail = userEmail;
    // userObject.type = type;

    if (userPassword) {
      const encryptedpass = AsymmetricEncrypt.encrypt(userPassword);
      const decryptedPass = AsymmetricEncrypt.decrypt(encryptedpass);
      userObject.userPassword = await bcrypt.hash(decryptedPass, 10);
    }

    const result = await UserDB.create(userObject);
    res.status(statusCode.Created).json({
      message: messages.UserRegistered,
      result,
    });
  } catch (err) {
    console.log(err);
    const request = req;
    Helper.writeErrorLog(request, err);
    return res.status(statusCode.InternalServerError).send({
      message: messages.errorTryAgain,
      error: err,
    });
  }
};

UserController.login = async (req, res, next) => {
  try {
    const user = await UserDB.findOne({ userEmail: req.body.userEmail }).lean();

    if (!user) {
      return res.status(statusCode.Unauthorized).json({
        message: messages.invalidEmailOrPassword,
      });
    }

    // need encrypted password from frontend
    const encryptedpass = AsymmetricEncrypt.encrypt(req.body.userPassword);
    const decryptedPass = AsymmetricEncrypt.decrypt(encryptedpass);

    // const decryptedPass = AsymmetricEncrypt.decrypt(req.body.password)
    const passwordResult = await bcrypt.compare(
      decryptedPass,
      user.userPassword
    );

    if (passwordResult === false) {
      return res.status(statusCode.Unauthorized).json({
        message: messages.invalidEmailOrPassword,
      });
    }

    const token = jwt.sign(
      {
        userrEmail: user.userEmail,
        id: user._id,
      },
      config.JWT_KEY,
      {
        expiresIn: "365d",
      }
    );

    await UserAuthLog.create({
      UserId: user._id,
      ipAddress: Helper.getIp(req),
    });
    return res.status(statusCode.OK).json({
      message: messages.authSuccessful,
      token,
      user,
    });
  } catch (err) {
    const request = req;
    Helper.writeErrorLog(request, err);
    res.status(statusCode.InternalServerError).json({
      message: messages.errorTryAgain,
      error: err,
    });
  }
};

UserController.deleteUser = async (req, res, next) => {
  try {
    const id = req.params;

    const result = await UserDB.findByIdAndDelete(
      { _id: mongoose.Types.ObjectId(id), type: "User" },
      { flag: 2 }
    );

    if (!result) {
      return res.status(statusCode.BadRequest).json({
        message: messages.UserNotFound,
      });
    }
    return res.status(statusCode.OK).json({
      message: messages.userDeleted,
      result,
    });
  } catch (err) {
    const request = req;
    Helper.writeErrorLog(request, err);
    res.status(statusCode.InternalServerError).json({
      messages: messages.errorTryAgain,
      error: err,
    });
  }
};

UserController.getUserList = async (req, res, next) => {
  let { limit, page, search } = req.query;

  if (!page) page = 1;
  if (!search) search = ""
  if (!limit || limit === "undefined" || limit === 1) limit = 10

  page = parseInt(page)
  limit = parseInt(limit)

  const matchObject = {}

  matchObject.flag = { $in: [1, 2] }

  try {
    if (search) {
      matchObject.userName = { $regex: search, $options: "i" }
    }
    let totalDocs = await UserDB.countDocuments(matchObject).lean()
    if (!totalDocs) {
      totalDocs = 0
    }

    const resultData = await UserDB.find(matchObject, {
      id: 1,
      flag: 1,
      status: 1,
      type: 1,
      userName: 1,
      userEmail: 1,
      password: 1,
      createdAt: 1,
    })
      .sort({ createdAt: -1 })
      .skip(page > 0 ? (page - 1) * limit : 0)
      .limit(limit)
      .lean();

    const paginationValues = await Helper.getPaginationValues(
      totalDocs,
      limit,
      page
    )
    const result = { docs: resultData, ...paginationValues }
    for (let i = 0; i < result.docs.length; i++) {
      const singleData = result.docs[i]
    }

    return res.status(statusCode.OK).json({
      message: messages.userRetrived,
      result
    });
  } catch (err) {
    const request = req
    Helper.writeErrorLog(request, err)
    return res.status(statusCode.InternalServerError).json({
      message: messages.errorTryAgain,
      error: err
    })
  }
};

UserController.getUserNo = async (req, res, next) => {
  try {
    const count_data = [];
    const userData = await UserDB.find().count();

    count_data.push(
      {
        user: userData
      }
    )
    return res.status(statusCode.OK).json({
      message: messages.userRetrived,
      count_data
    });

  }
  catch (err) {
    res.status(400).send({
      message: messages.errorTryAgain,
      error: err
    })
  }
}

module.exports = UserController;   