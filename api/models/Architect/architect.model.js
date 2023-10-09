const mongoose = require("mongoose");
const { FLAG, ARCHITECTROLE } = require("../../helper/enums");

const ArchitectSchema = new mongoose.Schema(
  {
    // Before Login as Freelancer Details

    architectName: { type: String, required: true },
    architectEmail: { type: String, required: true },
    architectPassword: { type: String, required: true },

    // Edit Profile details after login as freelancer

    architectProfile: { type:String },
    architectPhone: { type: Number },
    architectGst: { type: String },
    architectAdd: { type: String },
    architectCity: { type: String },
    architectPincode: { type: String },
    architectState: { type: String },
    architectCountry: { type: String },

    flag: { type: Number, enum: FLAG.value, default: FLAG.default },
    type: { type: String, enun: ARCHITECTROLE.value },
    status: { type: Number, default: 1 },
  },
  { timestamps: true }
);

ArchitectSchema.index({ architectEmail: -1 });
module.exports = mongoose.model("Architect", ArchitectSchema);
