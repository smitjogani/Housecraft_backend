const Helper = require("../../helper/index");
const message = require("../../helper/messages");
const statusCode = require("../../helper/statusCode");

const ArchitectValidator = {};

ArchitectValidator.edit = async (req, res, next) => {
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
  } = req.body;
  

  if (
    !architectName ||
    !architectEmail ||
    !architectPhone ||
    !architectGst ||
    !architectAdd ||
    !architectCity ||
    !architectPincode ||
    !architectState ||
    !architectCountry
  ) {
    return res.status(statusCode.UnprocessableEntity).json({
      message: "validation error",
      errors: "All The Fields Are Required",
    });
  }
  if (architectName.lenght >= 50) {
    return res.status(statusCode.UnprocessableEntity).json({
      message: "Validation error",
      errors: "The name can not be greater than fifty latters.",
    });
  }
  if (
    architectPhone.length <= 9 ||
    architectPhone.length >= 16 ||
    architectPhone == 1234567890 ||
    architectPhone == 0
  ) {
    return res.status(statusCode.UnprocessableEntity).json({
      message: "Validation error",
      errors: "Please enter a valid Mobile No.",
    });
  }

  next();
};

module.exports = ArchitectValidator;
