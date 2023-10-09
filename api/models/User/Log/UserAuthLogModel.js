const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const UserDb = require("../user.model");

const UserAuthLog = new mongoose.Schema(
  {
    UserId: { type: Schema.Types.ObjectId, required: true },
    ipAddress: { type: String, required: true, ref: UserDb },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserAuthLog", UserAuthLog);
