const express = require("express");
const InteriorDesignerController = require("../../controllers/InteriorDesigner/interiorDesigner.controller");
const router = express.Router();
const IntriorDesignerController = require("../../controllers/InteriorDesigner/interiorDesigner.controller");
const makeRequest = require("../../middleware/make-request");
const { multerService } = require("../../helper/uploadimage");
const MakeRequest = require("../../middleware/make-request");
const InteriorDesignerValidator = require("../../validators/interiorDsigner/interiorDesignerAuth.validator");
const upload = multerService("interiorDesignerProfile");

router.post("/interiorDesignerSignup", IntriorDesignerController.signup);
router.post("/interiorDesignerLogin", IntriorDesignerController.login);
// router.patch("/interiorDesignerDetails", MakeRequest, IntriorDesignerController.getInteriorDesignerDetails);
router.put("/UpdateInteriorDesignerDetails/:id", InteriorDesignerValidator.edit, IntriorDesignerController.edit);
router.post("/uploadInteriorDesignerProfile", makeRequest, upload.fields([{name: 'interiorDesignerProfile'}]),InteriorDesignerController.uploadImage)
//For Admin
router.get("/getInteriorDesigner/:id", MakeRequest, InteriorDesignerController.adminGetInteriorDesignerDetails);
router.delete("/DeleteInteriorDesigner/:id", MakeRequest, InteriorDesignerController.deleteInteriorDesigner);
router.get("/ListofInteriorDesigner", IntriorDesignerController.getInteriorDesignerList);
router.get('/NumberOfInteriorDesigner', InteriorDesignerController.getInteriorDesignerNo);

module.exports = router;
