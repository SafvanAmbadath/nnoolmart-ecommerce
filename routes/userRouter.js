// modules imported
const express=require("express")
const { postRegister } = require("../controller/usercontroller")
const router=express.Router()
const userCtrl=require("../controller/usercontroller")
const {userSession,checkBlock,noSession}=require("../middlewares/userSession")
const upload =require('../middlewares/multer')
const {productsPagination}=require("../middlewares/pagination")
const productsCollection=require("../model/productModel")

//login and register
router.get("/login",noSession,userCtrl.getLoginHandler)
router.get("/logout",userCtrl.getLogout)
router.get("/otp",userCtrl.getOtp);
router.get("/resendotp",userCtrl.getResendOtp)
router.post("/login",userCtrl.postLogin)
router.post("/verifyotp",userCtrl.postOtp)
router.route("/register")
.get(userCtrl.getRegisterHandler)
.post(userCtrl.postregister)

//home and products
router.get("/",userCtrl.getHomeHandler)
router.get("/products",productsPagination(productsCollection),userCtrl.getProducts)
router.get("/categoryproducts",userCtrl.getCategoryProducts)
router.get("/product",userCtrl.getProduct)

//profile and address
router.get("/profile",userSession,checkBlock,userCtrl.getProfile)
router.get("/address",userSession,checkBlock,userCtrl.getAddAddress)
router.get("/editaddress",userSession,checkBlock,userCtrl.getEditAddress)
router.post("/profileedit",userSession,checkBlock,upload.array("imageUrl",3),userCtrl.postProfileEdit)
router.post("/address",userSession,checkBlock,userCtrl.postAddAddress)
router.post('/editaddress',userSession,checkBlock,userCtrl.postEditAddress)
router.delete('/address',userSession,checkBlock,userCtrl.deleteAddress)

//cart
router.get("/cart",userSession,checkBlock,userCtrl.getCart)
router.post("/cart",userSession,checkBlock,userCtrl.postAddToCart)
router.patch("/cart",userSession,checkBlock,userCtrl.patchCartQuantity)
router.delete("/cart",userSession,checkBlock,userCtrl.deleteCartProduct)

//checkout and making order
router.get("/checkout",userSession,checkBlock,userCtrl.getCheckout)
router.post("/checkout/:CartId",userSession,checkBlock,userCtrl.postCheckout)
router.post('/verifyCoupon',userSession,checkBlock,userCtrl.postVerifyCoupon)
router.post("/create-order",userSession,checkBlock,userCtrl.paypalOrder)
router.post("/verifypayment",userSession,checkBlock,userCtrl.postVerifyPayment)
router.get('/order-complete',userSession,checkBlock,userCtrl.getOrderComplete)

//after order
router.get("/orders",userSession,checkBlock,userCtrl.getOrders)
router.get('/orderDetails',userSession,checkBlock,userCtrl.getOrderDetails)
router.get("/cancelorder",userSession,checkBlock,userCtrl.getCancelOrder)
router.post('/returnorder',userSession,checkBlock,userCtrl.postReturnOrder)
router.post('/refund',userSession,checkBlock,userCtrl.postRequestRefund)
router.post('/review',userSession,checkBlock,userCtrl.postReview)

// other routes
router.get("/contact",userCtrl.getContact)
router.get("/about",userCtrl.getAbout)

//error page
router.get("/error",userCtrl.getErrorPage)

module.exports=router


