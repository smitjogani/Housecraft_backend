const express = require('express')
const router = express.Router()
const AdminController = require('../../controllers/Admin/admin.controller')

router.post('/adminSignup',  AdminController.signup)
router.post('/adminLogin', AdminController.login)

module.exports = router