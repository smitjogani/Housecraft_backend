const mongoose = require("mongoose");
const { FLAG, ARCHITECTROLE } = require("../../helper/enums");

const InteriorDesignerSchema = new mongoose.Schema(
  {
    // Before Login as Freelancer Details

    interiorDesignerName: { type: String, required: true },
    interiorDesignerEmail: { type: String, required: true },
    interiorDesignerPassword: { type: String, required: true },

    // Edit Profile details after login as freelancer


    interiorDesignerProfile: { type:String },
    interiorDesignerPhone: { type: Number },
    interiorDesignerGst: { type: String },
    interiorDesignerAdd: { type: String },
    interiorDesignerCity: { type: String },
    interiorDesignerPincode: { type: String },
    interiorDesignerState: { type: String },
    interiorDesignerCountry: { type: String },

    flag: { type: Number, enum: FLAG.value, default: FLAG.default },
    type: { type: String, enun: ARCHITECTROLE.value },
    status: { type: Number, default: 1 },
  },
  { timestamps: true }
);

InteriorDesignerSchema.index({ interiorDesignerEmail: -1 });
module.exports = mongoose.model("Interior_Designer", InteriorDesignerSchema);
