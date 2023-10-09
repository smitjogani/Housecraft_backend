const mongoose = require('mongoose')
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const statusCode = require('../../helper/statusCode')
const message = require('../../helper/messages')
const Helper = require('../../helper/index')
const ProductDb = require('../../models/Product/product.model')
const productModel = require('../../models/Product/product.model');
const { config } = require('dotenv');

const ProductController = {}

ProductController.createProduct = async (req, res, next) => {

    const productObject = {}

    const {
        designerId,
        productName,
        productSize,
        productLocation,
        productPrice,
        productImg,
    } = req.body

    try {
        productObject.designerId = designerId
        productObject.productName = productName
        productObject.productSize = productSize
        productObject.productLocation = productLocation
        productObject.productPrice = productPrice
        productObject.productImg = productImg

        const result = await productModel.create(productObject)

        return res.status(statusCode.OK)
            .json({
                message: message.ProductAddedSuccessFully,
                result,
            })

    } catch (err) {
        const request = req
        Helper.writeErrorLog(request, err)
        res.status(statusCode.InternalServerError).json({
            message: message.errorTryAgain,
            err: err
        })
    }
}

ProductController.uploadImage = async (req, res, next) => {
    if (!req?.files?.productImg) {
        return res.status(statusCode.BadRequest)
            .json({
                message: message.noDataFound
            })
    }

    const imageArray = req.files.productImg

    const urlArray = []
    for (const i of imageArray) {
        // console.log(i.path)
        urlArray.push(i.path)
        // console.log(urlArray)
    }

    return res.status(statusCode.OK)
        .json({
            message: message.uploadedSuccessfully,
            urlArray
        })
}

ProductController.getProductList = async (req, res, next) => {
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
        let totalDocs = await ProductDb.countDocuments(matchObject).lean()
        if (!totalDocs) {
            totalDocs = 0
        }

        const resultData = await ProductDb.find(matchObject, {
            id: 1,
            flag: 1,
            status: 1,
            productName: 1,
            productSize: 1,
            productLocation: 1,
            productPrice: 1,
            productImg: 1,
            designerId: 1,
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
            if (singleData.productImg) singleData.productImg = await Helper.getValidImageUrl(singleData.productImg)
        }

        return res.status(statusCode.OK).json({
            message: message.productRetrive,
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

ProductController.deleteProduct = async (req, res, next) => {
    try {
        const id = req.params;

        const result = await ProductDb.findByIdAndDelete(
            { _id: mongoose.Types.ObjectId(id) },
            { flag: 2 }
        );

        if (!result) {
            return res.status(statusCode.BadRequest).json({
                message: message.ProductNotFound,
            });
        }
        return res.status(statusCode.OK).json({
            message: message.ProductDeleted,
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

ProductController.edit = async (req, res, next) => {
    const {
        productName,
        productSize,
        productLocation,
        productPrice,
        productImg,
    } = req.body;
    const id = req.params.id;
    try {
        const productUpdateObj = {};

        productUpdateObj.productName = productName;
        productUpdateObj.productSize = productSize;
        productUpdateObj.productLocation = productLocation;
        productUpdateObj.profuctPrice = productPrice;
        productUpdateObj.productImg = productImg;

        const product = await ProductDb.findByIdAndUpdate(
            mongoose.Types.ObjectId(id), productUpdateObj, { new: true }
        )

        return res.status(statusCode.OK).json({
            message: message.productUpdated,
            product,
        });
    } catch (err) {
        const request = req;
        Helper.writeErrorLog(request, err);
        return res.status(statusCode.InternalServerError).json({
            message: message.errorTryAgain,
        });
    }
};

// ProductController.getProduct = async (res, req, next) => {
//     try {
//         const token = req.headers.authorization.split(" ")[1];
//         const decoded = jwt.verify(token, config.JWT_KEY);
//         req.productData = decoded;

//         const { designerId } = decoded;
//         const productData = await ProductDb.findOne({ designerId: designerId });
//         if (productData == null || productData.flag !== 1) {
//             return res.status(statusCode.Unauthorized).json({
//                 message: "Auth Fail",
//             });
//         }

//         const product = productData;

//         return res.status(statusCode.OK).json({
//             message: message.productReturned,
//             product,
//         });
//     } catch (err) {
//         const request = req;
//         Helper.writeErrorLog(request, err);
//         // res.status(statusCode.InternalServerError).json({
//         //     message: message.errorTryAgain,
//         //     error: err,
//         // });
//     }
// }

ProductController.getProductNo = async (req, res, next) => {
    try {
        const count_data = [];
        const productData = await ProductDb.find().count();

        count_data.push(
            {
                product: productData
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

ProductController.getproductbydesignerId = async(req, res) => {
    const { designerId } = req.params;
    try {

        const projects = await ProductDb.find({ designerId: mongoose.Types.ObjectId(designerId) });
        // const result = await ProjectDb.findById(mongoose.Types.ObjectId(id)).lean()

        if (!projects) {
            return res.status(statusCode.BadRequest)
                .json({
                    message: message.DesignNotFound
                })
        }

        return res.status(statusCode.OK).json({
            message: message.designReturn,
            projects
        })

    } catch (err) {
        const request = req
        Helper.writeErrorLog(request, err)
        res.status(statusCode.InternalServerError).json({
            message: message.errorTryAgain,
            error: err
        })
    }
}

module.exports = ProductController;