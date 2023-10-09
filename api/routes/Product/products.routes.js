const express = require('express')
const router = express.Router()
const ProductController = require('../../controllers/Product/product.controller')
const MakeRequest = require('../../middleware/make-request');
// const ProductValidator = require("../../validators/product/productAuth.validator")
const { multerService } = require('../../helper/uploadimage');
const makeRequest = require('../../middleware/make-request');
const upload = multerService('product')

router.post('/createProduct', MakeRequest, ProductController.createProduct);
router.post('/uploadProductImage', MakeRequest, upload.fields([{ name: 'productImg' }]), ProductController.uploadImage);
router.get('/ListofProduct', upload.none(), ProductController.getProductList);
router.put("/updateProduct/:id",upload.fields([{ name: 'productImg' }]), ProductController.edit);
router.delete('/DeleteProduct/:id', MakeRequest, ProductController.deleteProduct)
// router.get('/getProduct/:id', makeRequest, ProductController.getProduct)
router.get('/NumberOfProduct', ProductController.getProductNo);
router.get('/getproductbydesignerId/:designerId', ProductController.getproductbydesignerId)

module.exports = router;