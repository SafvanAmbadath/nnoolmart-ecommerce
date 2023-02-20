//modules importing
const express=require("express")
const router=express.Router()
const adminCtrl=require("../controller/admincontroller")
const upload =require('../middlewares/multer')
const bannerUpload=require("../middlewares/bannerMulter")
const {adminSession}=require("../middlewares/adminSession")

//adminlogin
router.route("/adminlogin")
.get(adminCtrl.getAdminlogin)
.post(adminCtrl.postAdminlogin)
router.get("/adminlogout",adminCtrl.getAdminLogout)

//customers
router.get("/admincustomers",adminSession,adminCtrl.getAdminCustomers)
router.get("/adminblock/:id",adminSession,adminCtrl.getAdminBlock)
router.get("/adminunblock/:id",adminSession,adminCtrl.getAdminUnblock)

//admincategory
router.get("/admincategory",adminSession,adminCtrl.getAdminCategory)
router.get("/adminaddcategory",adminSession,adminCtrl.getAdminAddCategory)
router.post("/adminaddcategory",adminSession,upload.array("imageUrl",3),adminCtrl.postAdminAddCategory)
router.get("/admindeletecategory",adminSession,adminCtrl.getAdminDeleteCategory)
router.get("/admineditcategory",adminSession,upload.array("imageUrl",3),adminCtrl.getAdminEditCategory)
router.post("/admineditcategory",adminSession,upload.array("imageUrl",3),adminCtrl.postAdminEditCategory)

//admin products
router.get("/adminproducts",adminSession,upload.array("imageUrl",3),adminCtrl.getAdminProductManagement)
router.get("/adminaddproduct",adminSession,upload.array("imageUrl",3),adminCtrl.getAdminAddProduct)
router.post("/adminaddproduct",adminSession,upload.array("imageUrl",3),adminCtrl.postAdminAddProduct)
router.get("/admindeleteproduct",adminSession,adminCtrl.getAdminDeleteProduct)
router.get("/admineditproduct",adminSession,upload.array("imageUrl",3),adminCtrl.getAdminEditProduct)
router.post("/admineditproduct/:id",adminSession,upload.array("imageUrl",3),adminCtrl.postAdminEditProduct)

//coupon
router.get("/adminaddcoupon",adminSession,adminCtrl.getAdminAddCoupon)
router.post("/adminaddcoupon",adminSession,adminCtrl.postAdminAddCoupon)
router.get("/admincoupons",adminSession,adminCtrl.getAdminCoupon)
router.get("/admincouponactivate",adminSession,adminCtrl.getAdminCouponActivate)
router.get("/admincouponrevoke",adminSession,adminCtrl.getAdminCouponRevoke)

//order
router.get("/adminorders",adminSession,adminCtrl.getAdminOrders)
router.get('/adminorderdetails',adminSession,adminCtrl.getAdminOrderDetails)
router.post('/orderstatus',adminSession,adminCtrl.postChangeTrack)
router.get("/returnapprove",adminSession,adminCtrl.getAdminReturnApprove)

//banner
router.get("/adminbanners",adminSession,bannerUpload.array("imageUrl",3),adminCtrl.getAdminBanners)
router.get("/adminaddbanner",adminSession,bannerUpload.array("imageUrl",3),adminCtrl.getAdminAddBanner)
router.post("/adminaddbanner",adminSession,bannerUpload.array("imageUrl",3),adminCtrl.postAdminAddBanner)
router.get("/adminbanneractivate",adminSession,adminCtrl.getAdminBannerActivate)
router.delete("/adminbanners",adminSession,adminCtrl.deleteAdminBanner)

//admindashboard
router.get("/admindashboard",adminSession,adminCtrl.getAdminDashboard)
router.get('/ChartDetails',adminSession,adminCtrl.getAdminChartDetails)

//adminsalesreport
router.get('/salesreport',adminSession,adminCtrl.getAdminSalesReport)
router.get('/monthreport',adminSession,adminCtrl.getAdminMonthReport)
router.get('/yearreport',adminSession,adminCtrl.getAdminYearReport)

//error page
router.get("/adminerror",adminCtrl.getErrorPage)

module.exports=router