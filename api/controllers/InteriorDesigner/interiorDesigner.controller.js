const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const InteriorDesignerDB = require("../../models/InteriorDesigner/interiorDesigner.model");
const statusCode = require("../../helper/statusCode");
const message = require("../../helper/messages");
const AsymmetricEncrypt = require("../../helper/encryptDecrypt");
const config = require("../../../config");
const { INTERIORDESIGNERROLE } = require("../../helper/enums");
const messages = require("../../helper/messages");
const Helper = require("../../helper/index");
const InteriorDesignerAuthLog = require("../../models/InteriorDesigner/logs/InteriorDesignerAuthLogModel");

const InteriorDesignerController = {};

InteriorDesignerController.signup = async (req, res) => {
  const {
    interiorDesignerName,
    interiorDesignerEmail,
    interiorDesignerPassword,
  } = req.body;

  try {
    const nameExists = await InteriorDesignerDB.findOne({
      interiorDesignerName,
    }).lean();
    if (nameExists) {
      return res.status(statusCode.Conflict).json({
        message: message.InteriorDesignerExists,
      });
    }

    const InteriorDesignerEmail = await InteriorDesignerDB.findOne({
      interiorDesignerEmail,
    }).lean();
    if (InteriorDesignerEmail) {
      return res.status(statusCode.Conflict).json({
        message: messages.emailExists,
      });
    }

    const interiorDesignerObject = {
      flag: 1,
      type: INTERIORDESIGNERROLE.default,
    };

    interiorDesignerObject.interiorDesignerName = interiorDesignerName;
    interiorDesignerObject.interiorDesignerEmail = interiorDesignerEmail;

    if (interiorDesignerPassword) {
      const encryptedpass = AsymmetricEncrypt.encrypt(interiorDesignerPassword);
      const decryptedPass = AsymmetricEncrypt.decrypt(encryptedpass);
      interiorDesignerObject.interiorDesignerPassword = await bcrypt.hash(
        decryptedPass,
        10
      );
    }

    const result = await InteriorDesignerDB.create(interiorDesignerObject);
    res.status(statusCode.Created).json({
      message: messages.InteriorDesignerRegistered,
      result,
    });
  } catch (err) {
    console.log(err);
    const request = req;
    Helper.writeErrorLog(request, err);
    return res.status(statusCode.InternalServerError).send({
      message: message.errorTryAgain,
      error: err,
    });
  }
};

InteriorDesignerController.login = async (req, res) => {
  try {
    const interiordesigner = await InteriorDesignerDB.findOne({
      interiorDesignerEmail: req.body.interiorDesignerEmail,
    }).lean();

    if (!interiordesigner) {
      return res.status(statusCode.Unauthorized).json({
        message: messages.invalidEmailOrPassword,
      });
    }

    // need encrypted password from frontend
    const encryptedpass = AsymmetricEncrypt.encrypt(
      req.body.interiorDesignerPassword
    );
    const decryptedPass = AsymmetricEncrypt.decrypt(encryptedpass);

    // const decryptedPass = AsymmetricEncrypt.decrypt(req.body.password)
    const passwordResult = await bcrypt.compare(
      decryptedPass,
      interiordesigner.interiorDesignerPassword
    );

    if (passwordResult === false) {
      return res.status(statusCode.Unauthorized).json({
        message: messages.invalidEmailOrPassword,
      });
    }

    const token = jwt.sign(
      {
        interiorDesignerEmail: interiordesigner.interiorDesignerEmail,
        id: interiordesigner._id,
      },
      config.JWT_KEY,
      {
        expiresIn: "365d",
      }
    );

    await InteriorDesignerAuthLog.create({
      InteriorDesignerId: interiordesigner._id,
      ipAddress: Helper.getIp(req),
    });
    return res.status(statusCode.OK).json({
      message: messages.authSuccessful,
      token,
      interiordesigner,
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

InteriorDesignerController.getInteriorDesignerDetails = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, config.JWT_KEY);
    req.interiorDesignerData = decoded;

    const { id } = decoded;
    const interiorDesignerData = await InteriorDesignerDB.findOne({ _id: id });
    if (interiorDesignerData == null || interiorDesignerData.flag !== 1) {
      return res.status(statusCode.Unauthorized).json({
        message: "Auth Fail",
      });
    }

    const interiorDesigner = interiorDesignerData;

    return res.status(statusCode.OK).json({
      message: messages.Interiordesignerprofilereturn,
      interiorDesigner,
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

InteriorDesignerController.edit = async (req, res, next) => {

  const {
    interiorDesignerName,
    interiorDesignerEmail,
    interiorDesignerPhone,
    interiorDesignerGst,
    interiorDesignerAdd,
    interiorDesignerCity,
    interiorDesignerPincode,
    interiorDesignerState,
    interiorDesignerCountry,
    interiorDesignerProfile
  } = req.body
  const id = req.params.id
  try {

    // const token = req.headers.authorization.split('')[1]
    // const decoded = jwt.verify(token, config.JWT_KEY)
    // req.freelancerData = decoded
    // const { id } = decoded

    const interiorDesignerUpdateObj = {}

    interiorDesignerUpdateObj.interiorDesignerName = interiorDesignerName
    interiorDesignerUpdateObj.interiorDesignerEmail = interiorDesignerEmail
    interiorDesignerUpdateObj.interiorDesignerPhone = interiorDesignerPhone
    interiorDesignerUpdateObj.interiorDesignerGst = interiorDesignerGst
    interiorDesignerUpdateObj.interiorDesignerAdd = interiorDesignerAdd
    interiorDesignerUpdateObj.interiorDesignerCity = interiorDesignerCity
    interiorDesignerUpdateObj.interiorDesignerPincode = interiorDesignerPincode
    interiorDesignerUpdateObj.interiorDesignerState = interiorDesignerState
    interiorDesignerUpdateObj.interiorDesignerCountry = interiorDesignerCountry
    interiorDesignerUpdateObj.interiorDesignerProfile = interiorDesignerProfile

    // const freelancer = await FreelancerDB.findByIdAndUpdate(mongoose.Types.ObjectId(id), { $set: architectUpdateObj}, {new: true, runValidators: true})
    const interiordesigner = await InteriorDesignerDB.findByIdAndUpdate({ _id: id }, { $set: interiorDesignerUpdateObj })

    return res.status(statusCode.OK).json({
      message: message.profileUpdated,
      interiordesigner
    })

  } catch (err) {
    const request = req
    Helper.writeErrorLog(request, err)
    return res.status(statusCode.InternalServerError).json({
      message: message.errorTryAgain
    })
  }
}

InteriorDesignerController.getInteriorDesignerList = async (req, res, next) => {
  let { limit, page, search } = req.query;

  if (!page) page = 1;
  if (!search) search = "";
  if (!limit || limit === "undefined" || limit === 1) limit = 100;

  page = parseInt(page);
  limit = parseInt(limit);

  const matchObject = {};

  matchObject.flag = { $in: [1, 2] };

  try {
    if (search) {
      matchObject.interiorDesignerName = { $regex: search, $options: "i" };
    }
    let totalDocs = await InteriorDesignerDB.countDocuments(matchObject).lean();
    if (!totalDocs) {
      totalDocs = 0;
    }

    const resultData = await InteriorDesignerDB.find(matchObject, {
      id: 1,
      flag: 1,
      status: 1,
      type: 1,
      interiorDesignerName: 1,
      interiorDesignerEmail: 1,
      interiorDesignerPhone: 1,
      interiorDesignerGst: 1,
      interiorDesignerAdd: 1,
      interiorDesignerCity: 1,
      interiorDesignerPincode: 1,
      interiorDesignerState: 1,
      interiorDesignerCountry: 1,
      interiorDesignerProfile: 1,
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
    );
    const result = { docs: resultData, ...paginationValues };
    for (let i = 0; i < result.docs.length; i++) {
      const singleData = result.docs[i];
      if (singleData.interiorDesignerProfile) singleData.interiorDesignerProfile = await Helper.getValidImageUrl(singleData.interiorDesignerProfile)
    }

    return res.status(statusCode.OK).json({
      message: message.InteriorDesignerRetrieved,
      result,
    });
  } catch (err) {
    const request = req;
    Helper.writeErrorLog(request, err);
    return res.status(statusCode.InternalServerError).json({
      message: message.errorTryAgain,
      error: err,
    });
  }
};

InteriorDesignerController.adminGetInteriorDesignerDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await InteriorDesignerDB.findById(
      mongoose.Types.ObjectId(id)
    ).lean();
    if (!result) {
      return res.status(statusCode.BadRequest).json({
        message: message.InteriorDesignerNotFound,
      });
    }

    return res.status(statusCode.OK).json({
      message: messages.Interiordesignerprofilereturn,
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

InteriorDesignerController.deleteInteriorDesigner = async (req, res, next) => {
  try {
    const id = req.params;

    const result = await InteriorDesignerDB.findByIdAndDelete(
      { _id: mongoose.Types.ObjectId(id), type: "INTERIORDESIGNER" },
      { flag: 2 }
    );

    if (!result) {
      return res.status(statusCode.BadRequest).json({
        message: message.InteriorDesignerNotFound,
      });
    }
    return res.status(statusCode.OK).json({
      message: message.InteriorDesignerDeleted,
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

InteriorDesignerController.uploadImage = async (req, res, next) => {
  if (!req?.files?.interiorDesignerProfile) {
    return res.status(statusCode.BadRequest)
      .json({
        message: messages.noDataFound
      })
  }

  const imageArray = req.files.interiorDesignerProfile

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

InteriorDesignerController.getInteriorDesignerNo = async (req, res, next) => {
  try {
    const count_data = [];
    const interiorDesignerData = await InteriorDesignerDB.find().count();

    count_data.push(
      {
        InteriorDesigner : interiorDesignerData
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


module.exports = InteriorDesignerController;