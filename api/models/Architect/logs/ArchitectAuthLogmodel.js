const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ArchitectDB = require("../architect.model");

const ArchitectAuthLog = new mongoose.Schema(
  {
    ArchitectId: { type: Schema.Types.ObjectId, required: true },
    ipAddress: { type: String, required: true, ref: ArchitectDB },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ArchitectAuthLog", ArchitectAuthLog);
