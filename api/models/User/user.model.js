const mongoose = require("mongoose");
const { FLAG, USERROLE } = require("../../helper/enums");

const Userschema = new mongoose.Schema(
  {
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    userPassword: { type: String, required: true },
    flag: { type: Number, enum: FLAG.value, default: FLAG.default },
    type: { type: String, enun: USERROLE.value },
    status: { type: Number, default: 1 },
  },
  { timestamps: true }
);

Userschema.index({ userEmail: -1 });
module.exports = mongoose.model("User", Userschema);
