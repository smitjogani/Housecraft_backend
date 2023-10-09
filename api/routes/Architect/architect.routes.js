const express = require("express");
const router = express.Router();
const ArchitectController = require("../../controllers/Architect/architect.controller");
const MakeRequest = require("../../middleware/make-request");
const { multerService } = require("../../helper/uploadimage");
const ArchitectValidator = require("../../validators/architect/architectAuth.validator");
const upload = multerService('ArchitectProfile');

router.post("/architectSignup", ArchitectController.signup);
router.post("/architectLogin", ArchitectController.login);
// router.patch("/architectDetails",MakeRequest,ArchitectController.getArchitectDetails);
router.put("/UpdateArchitectDetails/:id", ArchitectValidator.edit, ArchitectController.edit);
router.post('/uploadArchitectProfileImage', MakeRequest, upload.fields([{ name:'architectProfile'}]), ArchitectController.uploadImage )

//For Admin
router.get('/getArchitect/:id', MakeRequest, ArchitectController.adminGetArchitectDetails)
router.delete('/DeleteArchitect/:id', MakeRequest, ArchitectController.deleteArchitect)
router.get('/ListofArchitect', ArchitectController.getArchitectList)
router.get('/NumberOfArchitect', ArchitectController.getArchitectNo);

module.exports = router;
