const Helper = require("../../helper/index");
const message = require("../../helper/messages");
const statusCode = require("../../helper/statusCode");

const ProductValidator = {};

ProductValidator.edit = async (req, res, next) => {
    const {
        productName,
        productSize,
        productLocation,
        productPrice,
    } = req.body;


    if (
        !productName ||
        !productSize ||
        !productLocation ||
        !productPrice 
    ) {
        return res.status(statusCode.UnprocessableEntity).json({
            message: "validation error",
            errors: "All The Fields Are Required",
        });
    }
    if (productName.lenght >= 50) {
        return res.status(statusCode.UnprocessableEntity).json({
            message: "Validation error",
            errors: "The name can not be greater than fifty latters.",
        });
    }
    next();
};

module.exports =  ProductValidator;
