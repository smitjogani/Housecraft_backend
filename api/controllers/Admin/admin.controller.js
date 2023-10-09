const mongoose = require("mongoose");
const AdminDB = require("../../models/Admin/admin.model");
const statusCode = require("../../helper/statusCode");
const messages = require("../../helper/messages");
const AsymmetricEncrypt = require("../../helper/encryptDecrypt");
const bcrypt = require("bcryptjs");
const config = require("../../../config");
const adminAuthLogModel = require("../../models/Admin/logs/adminAuthLog.model");
const jwt = require("jsonwebtoken");
const Helper = require("../../helper/index");
const { FLAG } = require("../../helper/enums");

const AdminController = {};

AdminController.signup = async (req, res) => {
  const { email, name, password } = req.body;

  try {
    const adminData = await AdminDB.findOne({ email }).lean();
    if (adminData) {
      return res.status(statusCode.Conflict).json({
        message: messages.emailExists,
      });
    }
    const adminObject = {
      flag: 1,
    };
    adminObject.name = name;
    adminObject.email = email;
    if (password) {
      const encryptedpass = AsymmetricEncrypt.encrypt(password);
      const decryptedPass = AsymmetricEncrypt.decrypt(encryptedpass);
      adminObject.password = await bcrypt.hash(decryptedPass, 10);
    }
    const result = await AdminDB.create(adminObject);
    res.status(statusCode.Created).json({
      message: messages.adminRegistered,
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

AdminController.login = async (req, res, next) => {
  try {
    const admin = await AdminDB.findOne({ email: req.body.email }).lean();

    if (!admin) {
      return res.status(statusCode.Unauthorized).json({
        message: messages.invalidEmailOrPassword,
      });
    }

    // need encrypted password from frontend
    const encryptedpass = AsymmetricEncrypt.encrypt(req.body.password);
    const decryptedPass = AsymmetricEncrypt.decrypt(encryptedpass);

    // const decryptedPass = AsymmetricEncrypt.decrypt(req.body.password)
    const passwordResult = await bcrypt.compare(decryptedPass, admin.password);

    if (passwordResult === false) {
      return res.status(statusCode.Unauthorized).json({
        message: messages.invalidEmailOrPassword,
      });
    }

    const token = jwt.sign(
      {
        email: admin.email,
        id: admin._id,
      },
      config.JWT_KEY,
      {
        expiresIn: "365d",
      }
    );
    // admin = await result.doc[0]
    await adminAuthLogModel.create({
      adminId: admin._id,
      ipAddress: Helper.getIp(req),
    });
    return res.status(statusCode.OK).json({
      message: messages.authSuccessful,
      token,
      admin,
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

// AdminController.edit = async (req, res, next) => {
//   const { email, name } = req.body;
//   const id = req.params.id;
//   try {
//     const updateObj = {};

//     updateObj.name = name;
//     updateObj.email = email;

//     const admin = await AdminDB.findByIdAndUpdate(
//       { _id: id },
//       { $set: updateObj }
//     );
//     return res.status(statusCode.Accepted).json({
//       messages: messages.profileUpdated,
//       result: admin,
//     });
//   } catch (err) {
//     const request = req;
//     Helper.writeErrorLog(request, err);
//     return res.status(statusCode.InternalServerError).json({
//       message: messages.errorTryAgain,
//     });
//   }
// };

// AdminController.detail =  async (req, res, next) => {
//     try{
//         const token = req.headers.authorization.split(' ')[1]
//         const decoded = jwt.verify(token, config.JWT_KEY)
//         req.adminDataa = decoded

//         const { id } = decoded
//         const adminDataa = await AdminDB.findOne({ _id: id })
//         if (adminDataa === null || adminDataa.flag !== 1) {
//             return res.status(statusCode.Unauthorized).json({
//                 message: 'Auth Fail'
//             })
//         }
//         const admin =  adminDataa

//         return res.status(statusCode.OK).json({
//             message: messages.profileReturned,
//             admin
//         })

//     } catch (err){
//         return res.status(statusCode.InternalServerError).json({
//             message: messages.authFail,
//             error:err
//         })
//     }
// }

module.exports = AdminController;
