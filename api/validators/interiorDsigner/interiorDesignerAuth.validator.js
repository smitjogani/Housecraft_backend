const Helper = require("../../helper/index");
const message = require("../../helper/messages");
const statusCode = require("../../helper/statusCode");

const InteriorDesignerValidator = {};

InteriorDesignerValidator.edit = async (req, res, next) => {
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
  } = req.body;

  if (
    !interiorDesignerName ||
    !interiorDesignerEmail ||
    !interiorDesignerPhone ||
    !interiorDesignerGst ||
    !interiorDesignerAdd ||
    !interiorDesignerCity ||
    !interiorDesignerPincode ||
    !interiorDesignerState ||
    !interiorDesignerCountry
  ) {
    return res.status(statusCode.UnprocessableEntity).json({
      message: "validation error",
      errors: "All The Fields Are Required",
    });
  }
  if (interiorDesignerName.lenght >= 50) {
    return res.status(statusCode.UnprocessableEntity).json({
      message: "Validation error",
      errors: "The name can not be greater than fifty latters.",
    });
  }
  if (
    interiorDesignerPhone.length <= 9 ||
    interiorDesignerPhone.length >= 16 ||
    interiorDesignerPhone == 1234567890 ||
    interiorDesignerPhone == 0
  ) {
    return res.status(statusCode.UnprocessableEntity).json({
      message: "Validation error",
      errors: "Please enter a valid Mobile No.",
    });
  }

  next();
};

module.exports = InteriorDesignerValidator;
