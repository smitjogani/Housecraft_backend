const express = require("express");
const router = express.Router();
const UserController = require("../../controllers/User/user.controller");
const MakeRequest = require('../../middleware/make-request');
const { multerService } = require('../../helper/uploadimage')

const upload = multerService('Recruiter')

router.post("/userSignup", UserController.signup);
router.post("/userLogin", upload.none(),UserController.login);

//For Admin
router.delete('/DeleteUser/:id', MakeRequest, UserController.deleteUser)
router.get('/ListofUsers', UserController.getUserList)
router.get('/NumberOfUser', UserController.getUserNo);

module.exports = router;
