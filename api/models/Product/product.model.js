const mongoose = require("mongoose");
const { FLAG } = require("../../helper/enums")
const { ObjectId } = require('mongoose').Types

const ProductSchema = new mongoose.Schema(
    {
        designerId: {type: ObjectId},
        productName: { type: String },
        productSize: { type: String },
        productLocation: { type: String },
        productPrice: { type: String },
        productImg: { type: String },

        flag: { type: Number, enum: FLAG.value, default: FLAG.default },
        status: { type: Number, default: 1 },

    },
    { timestamps: true }
)

module.exports = mongoose.model('Product', ProductSchema)