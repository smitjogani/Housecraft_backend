const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const ArchitectDB = require("../../models/Architect/architect.model");
const statusCode = require("../../helper/statusCode");
const message = require("../../helper/messages");
const AsymmetricEncrypt = require("../../helper/encryptDecrypt");
const config = require("../../../config");
const { ARCHITECTROLE } = require("../../helper/enums");
const messages = require("../../helper/messages");
const Helper = require("../../helper/index");
const ArchitectAuthLog = require("../../models/Architect/logs/ArchitectAuthLogmodel");

const ArchitectController = {};

ArchitectController.signup = async (req, res) => {
  const { architectName, architectEmail, architectPassword } = req.body;

  try {
    const nameExists = await ArchitectDB.findOne({ architectName }).lean();
    if (nameExists) {
      return res.status(statusCode.Conflict).json({
        message: message.ArchitectExists,
      });
    }

    const ArchitectEmail = await ArchitectDB.findOne({ architectEmail }).lean();
    if (ArchitectEmail) {
      return res.status(statusCode.Conflict).json({
        message: messages.emailExists,
      });
    }

    const architectObject = {
      flag: 1,
      type: ARCHITECTROLE.default,
    };

    architectObject.architectName = architectName;
    architectObject.architectEmail = architectEmail;

    if (architectPassword) {
      const encryptedpass = AsymmetricEncrypt.encrypt(architectPassword);
      const decryptedPass = AsymmetricEncrypt.decrypt(encryptedpass);
      architectObject.architectPassword = await bcrypt.hash(decryptedPass, 10);
    }

    const result = await ArchitectDB.create(architectObject);
    res.status(statusCode.Created).json({
      message: messages.ArchitectRegistered,
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

ArchitectController.login = async (req, res) => {
  try {
    const architect = await ArchitectDB.findOne({
      architectEmail: req.body.architectEmail,
    }).lean();

    if (!architect) {
      return res.status(statusCode.Unauthorized).json({
        message: messages.invalidEmailOrPassword,
      });
    }

    // need encrypted password from frontend
    const encryptedpass = AsymmetricEncrypt.encrypt(req.body.architectPassword);
    const decryptedPass = AsymmetricEncrypt.decrypt(encryptedpass);

    // const decryptedPass = AsymmetricEncrypt.decrypt(req.body.password)
    const passwordResult = await bcrypt.compare(
      decryptedPass,
      architect.architectPassword
    );

    if (passwordResult === false) {
      return res.status(statusCode.Unauthorized).json({
        message: messages.invalidEmailOrPassword,
      });
    }

    const token = jwt.sign(
      {
        architectEmail: architect.architectEmail,
        id: architect._id,
      },
      config.JWT_KEY,
      {
        expiresIn: "365d",
      }
    );

    await ArchitectAuthLog.create({
      ArchitectId: architect._id,
      ipAddress: Helper.getIp(req),
    });
    return res.status(statusCode.OK).json({
      message: messages.authSuccessful,
      token,
      architect,
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

ArchitectController.getArchitectDetails = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, config.JWT_KEY);
    req.architectData = decoded;

    const { id } = decoded;
    const architectData = await ArchitectDB.findOne({ _id: id });
    if (architectData == null || architectData.flag !== 1) {
      return res.status(statusCode.Unauthorized).json({
        message: "Auth Fail",
      });
    }

    const architect = architectData;

    return res.status(statusCode.OK).json({
      message: messages.ArchitectprofileReturned,
      architect,
    });
  } catch (err) {
    const request = req;
    Helper.writeErrorLog(request, err);
    res.status(statusCode.InternalServerError).json({
      message: message.errorTryAgain,
      error: err,
    });
  }
};

ArchitectController.edit = async (req, res, next) => {
  const {
    architectName,
    architectEmail,
    architectPhone,
    architectGst,
    architectAdd,
    architectCity,
    architectPincode,
    architectState,
    architectCountry,
    architectProfile,
  } = req.body;
  const id = req.params.id;
  try {

    const architectUpdateObj = {};

    architectUpdateObj.architectName = architectName;
    architectUpdateObj.architectEmail = architectEmail;
    architectUpdateObj.architectPhone = architectPhone;
    architectUpdateObj.architectGst = architectGst;
    architectUpdateObj.architectAdd = architectAdd;
    architectUpdateObj.architectCity = architectCity;
    architectUpdateObj.architectPincode = architectPincode;
    architectUpdateObj.architectState = architectState;
    architectUpdateObj.architectCountry = architectCountry;
    architectUpdateObj.architectProfile = architectProfile

    const architect = await ArchitectDB.findByIdAndUpdate(
      mongoose.Types.ObjectId(id), architectUpdateObj, { new: true, runValidators: true }
    )

    return res.status(statusCode.OK).json({
      message: message.profileUpdated,
      architect,
    });
  } catch (err) {
    const request = req;
    Helper.writeErrorLog(request, err);
    return res.status(statusCode.InternalServerError).json({
      message: message.errorTryAgain,
    });
  }
};

ArchitectController.getArchitectList = async (req, res, next) => {
  let { limit, page, search } = req.query;

  if (!page) page = 1;
  if (!search) search = ""
  if (!limit || limit === "undefined" || limit === 1) limit = 100

  page = parseInt(page)
  limit = parseInt(limit)

  const matchObject = {}

  matchObject.flag = { $in: [1, 2] }

  try {
    if (search) {
      matchObject.architectName = { $regex: search, $options: "i" }
    }
    let totalDocs = await ArchitectDB.countDocuments(matchObject).lean()
    if (!totalDocs) {
      totalDocs = 0
    }

    const resultData = await ArchitectDB.find(matchObject, {
      id: 1,
      flag: 1,
      status: 1,
      type: 1,
      architectName: 1,
      architectEmail: 1,
      architectPhone: 1,
      architectGst: 1,
      architectAdd: 1,
      architectCity: 1,
      architectPincode: 1,
      architectState: 1,
      architectCountry: 1,
      architectProfile: 1,
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
      if (singleData.architectProfile) singleData.architectProfile = await Helper.getValidImageUrl(singleData.architectProfile)
    }

    return res.status(statusCode.OK).json({
      message: message.ArchitectRetrived,
      result
    });
  } catch (err) {
    const request = req
    Helper.writeErrorLog(request, err)
    return res.status(statusCode.InternalServerError).json({
      message: message.errorTryAgain,
      error: err
    })
  }
};

ArchitectController.adminGetArchitectDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await ArchitectDB.findById(
      mongoose.Types.ObjectId(id)
    ).lean();
    if (!result) {
      return res.status(statusCode.BadRequest).json({
        message: message.ArchitectNotFound,
      });
    }

    return res.status(statusCode.OK).json({
      message: messages.ArchitectprofileReturned,
      result,
    });
  } catch (err) {
    const request = req;
    Helper.writeErrorLog(request, err);
    res.status(statusCode.InternalServerError).json({
      message: message.errorTryAgain,
      error: err,
    });
  }
};

ArchitectController.deleteArchitect = async (req, res, next) => {
  try {
    const id = req.params;

    const result = await ArchitectDB.findByIdAndDelete(
      { _id: mongoose.Types.ObjectId(id), type: "ARCHITECT" },
      { flag: 2 }
    );

    if (!result) {
      return res.status(statusCode.BadRequest).json({
        message: message.ArchitectNotFound,
      });
    }
    return res.status(statusCode.OK).json({
      message: message.ArchitectDeleted,
      result,
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

ArchitectController.uploadImage = async (req, res, next) => {
  if (!req?.files?.architectProfile) {
    return res.status(statusCode.BadRequest)
      .json({
        message: messages.noDataFound
      })
  }

  const imageArray = req.files.architectProfile

  const urlArray = []
  for (const i of imageArray) {
    // console.log(i.path)
    urlArray.push(i.path)
    // console.log(urlArray)
  }

  return res.status(statusCode.OK)
    .json({
      message: messages.uploadedSuccessfully,
      urlArray
    })
}


ArchitectController.getArchitectNo = async (req, res, next) => {
  try {
      const count_data = [];
      const architectData = await ArchitectDB.find().count();

      count_data.push(
          {
              architect: architectData
          }
      )
      return res.status(statusCode.OK).json({
          message: message.userRetrived,
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


module.exports = ArchitectController;
