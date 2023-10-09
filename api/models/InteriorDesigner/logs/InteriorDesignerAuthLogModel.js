const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const InteriorDesignerDB = require("../interiorDesigner.model");

const InteriorDesignerAuthLog = new mongoose.Schema(
  {
    InteriorDesignerId: { type: Schema.Types.ObjectId, required: true },
    ipAddress: { type: String, required: true, ref: InteriorDesignerDB },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "InteriorDesignerAuthLog",
  InteriorDesignerAuthLog
);
