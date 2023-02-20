require('dotenv').config()
const userCollection=require("../model/userModel")
const categoryCollection=require("../model/categoryModel")
const productsCollection=require("../model/productModel")
const couponCollection=require("../model/couponModel")
const orderCollection=require("../model/orderModel")
const bannerCollection=require("../model/bannerModel")
const moment=require("moment")
module.exports={
    getAdminlogin:(req,res)=>{
      try {
        if(req.session.adminLoggedIn){
            res.redirect("/admindashboard")
        }else{
            res.render("admin/adminlogin",
            {adminLogErr:req.flash("adminLogErr")}
            )
        }
      } catch (error) {
        res.render("admin/error");
      }   
    },
    postAdminlogin:(req,res)=>{
      try { 
        if(req.body.name==process.env.ADMIN_NAME && req.body.password==process.env.ADMIN_PASSWORD ){
            req.session.adminLoggedIn=true
            res.redirect("/admindashboard")
        }else{
            req.flash("adminLogErr","Wrong email or Password")
            res.redirect("/adminlogin")
            req.session.adminLoggedError=true
        }
      } catch (error) {
        res.render("admin/error");
      }
    },
    getAdminCustomers:async(req,res)=>{
      try {
        const customers=await userCollection.find({})
       
        res.render("admin/admincustomers",{customers})
      } catch (error) {
        res.render("admin/error");
      }
    },
    getAdminBlock:async(req,res)=>{
      try {
       const customerid=req.params.id;
    
       let customerdata=await userCollection.findByIdAndUpdate(customerid,{block:true})
       if(customerdata){
        res.redirect("/admincustomers")
       }else{
        res.render("/admindashboard")
       } 
      } catch (error) {
        res.render("admin/error");
      }
    },
    getAdminUnblock:async(req,res)=>{
      try {
        const customerid=req.params.id;
       
        let customerdata=await userCollection.findByIdAndUpdate(customerid,{block:false})
        res.redirect("/admincustomers")
      } catch (error) {
        res.render("admin/error");
      }
    },

   
    getAdminCategory:async(req,res)=>{
      try {
        const categories=await categoryCollection.find({}).sort({createdAt:-1})
        // console.log(categories)
        res.render("admin/admincategory",{categories})
      } catch (error) {
        res.render("admin/error");
      }
    },
    getAdminAddCategory:(req,res)=>{
      try {
        res.render("admin/adminaddcategory",{
          catAddErr:req.flash("catAddErr"),
          catExistErr:req.flash("catExistErr"),
        }
        ) 
      } catch (error) {
        res.render("admin/error");
      } 
    },
    postAdminAddCategory:async(req,res)=>{  
      try {
            // console.log(req.files); 
            // console.log(req.body); 
        const reqCategory=req.body.categoryName
        const imageUrl=req.files;
        if(reqCategory && imageUrl){
            let regExp=new RegExp(reqCategory,"i")
            let dbCategory=await categoryCollection.findOne({categoryName:{$regex:regExp}})
            const img=[];
            imageUrl.forEach((element) => {
                // console.log(element);
                img.push(element.filename);
            });
            if(!dbCategory){
                Object.assign(req.body,{imageUrl:img});
                const newCategory=await new categoryCollection(req.body);
                await newCategory
                .save()
                .then(()=>{
                    res.redirect("/admincategory")
                    // console.log("category document created"); 
                })
                .catch((err)=>{
                    console.log(err)
                })
            }else{
                
                req.flash("catExistErr","Category with this name already exist")
                res.redirect("/adminaddcategory")
            }
           
        }else{
          req.flash("catAddErr","Fill all columns")
          res.redirect("/adminaddcategory")
        }
      } catch (error) {
        res.render("admin/error");
      }  
       
    },
    getAdminProductManagement:async(req,res)=>{
      try {
        const products=await productsCollection.find().sort({updatedAt:-1})
        // console.log(products);
        res.render("admin/adminproducts",{products:products})
      } catch (error) {
        res.render("admin/error");
      }
    },
    getAdminAddProduct:async(req,res)=>{
      try {
        const categories=await categoryCollection.find()
        res.render("admin/adminaddproduct",{
          categories,
          addProductErr:req.flash("addProductErr")
        })  
      } catch (error) {
        res.render("admin/error");
      }
    },
    postAdminAddProduct:async(req,res)=>{
      try {
        // console.log(req.files)
        const {productName,categoryName,stock,price,description,offer,brand}=req.body
        const imageUrl=req.files;
        console.log(req.body)
        let img=[];
        imageUrl.forEach((element)=>{
            img.push(element.filename);
        });
        if(productName && categoryName && description && price && stock && img.length > 0 && brand){
           
            const category=await categoryCollection.findOne({categoryName:categoryName},{_id:0,offer:1})
            const categoryOffer=category.offer
            const categoryOfferPrice=Math.round(price-(price*categoryOffer)/100 )
            const productOfferPrice=Math.round(price-(price*offer)/100)
            let discountPrice;
            if(categoryOfferPrice < productOfferPrice){
                discountPrice=categoryOfferPrice
            }else if(productOfferPrice < categoryOfferPrice){
                discountPrice=productOfferPrice
            }else{
                discountPrice=0
            }
            Object.assign(req.body,{
                imageUrl:img,
                discountPrice:discountPrice
            });
            const newProduct=await new productsCollection(req.body);
            await newProduct
            .save()
            .then(()=>{
                res.redirect("/adminproducts")
            })
            .catch((err)=>{
                console.log(err)
            })
        }else{
          console.log("err")
          req.flash("addProductErr","Fill all columns")
          res.redirect("/adminaddproduct")
          
        }
    
      } catch (error) {
        res.render("admin/error");
      }
        
    },
    getAdminDeleteProduct:async(req,res)=>{
      try {
        // console.log("in deleting product")
         const productId=req.query.productid
        //  console.log(productId)
         await productsCollection.findByIdAndDelete(productId).then(()=>{
            res.redirect("/adminproducts")
         })
        } catch (error) {
          res.render("admin/error");
        }
    },
    getAdminEditProduct:async(req,res)=>{
      try {
        const productId=req.query.productid
        const categories=await categoryCollection.find()
        await productsCollection.findOne({_id:productId}).then((product)=>{
            // console.log(product)
            res.render("admin/admineditproduct",{
                product,
                categories,
                editProductErr:req.flash("editProductErr")
            })
        })
      } catch (error) {
        res.render("admin/error");
      }
    },
    postAdminEditProduct:async(req,res)=>{
      try {
        const productId=req.params.id
        console.log(req.body) 
        // console.log(productId)
        const {productName,categoryName,stock,price,description,offer,brand}=req.body
        if(productName && categoryName && description && price && stock && brand){
            // const Price=parseInt(price)
            // console.log(categoryName)
            // console.log(typeof Price)
            // console.log(typeof offer)
            const category=await categoryCollection.findOne({categoryName:categoryName}) 
            console.log(category)
            const categoryOffer=category.offer
            console.log(categoryOffer)

            const categoryOfferPrice=Math.round(price-(price*categoryOffer)/100)
            console.log(categoryOfferPrice)
            
            
            const productOfferPrice=Math.round(price-(price*offer)/100)
            console.log(productOfferPrice)
            
            let discountPrice;
            if(categoryOfferPrice < productOfferPrice){
                // console.log("categoryofferprice")
                discountPrice=categoryOfferPrice
            }else if(productOfferPrice < categoryOfferPrice){
                // console.log("productofferprice")
                discountPrice=productOfferPrice
            }else{
                console.log("equal")
                discountPrice=productOfferPrice;
            }
            // console.log(req.files)
            if(req.files.length === 0){
                Object.assign(req.body,{
                    discountPrice:discountPrice,
                    updatedAt:moment().format("MM/DD/YYYY")
                })
                await productsCollection.findByIdAndUpdate(productId,req.body,{
                    upsert:true,
                    new:true,
                    runValidators:true,
                })
                res.redirect("/adminproducts")
            }else{
               let img=[];
               req.files.forEach((element)=>{
                img.push(element.filename)
               })
               Object.assign(req.body,{
                imageUrl:img,
                discountPrice:discountPrice,
                updatedAt:moment().format("MM/DD/YYYY")
               })
               await productsCollection.findByIdAndUpdate(productId,req.body,{
                upsert:true,
                new:true,
                runValidators:true
               })
               res.redirect("/adminproducts")
            }

        }else{
           req.flash("editProductErr","Fill all columns")
           res.redirect("/admineditproduct?productid="+productId)
        }
      } catch (error) {
        res.render("admin/error");
      }
    },
    getAdminDeleteCategory:async(req,res)=>{
      try {
        const categoryId=req.query.categoryid
        await categoryCollection.findByIdAndDelete(categoryId).then(()=>{
            res.redirect("/admincategory")
        })
      } catch (error) {
        res.render("admin/error");
      }
    },
    getAdminEditCategory:async(req,res)=>{
      try {
        const categoryId=req.query.categoryid
        await categoryCollection.findById(categoryId).then((category)=>{
            res.render("admin/admineditcategory",{
              category,
              editCatErr:req.flash("editCatErr"),
             
            })
        })
      } catch (error) {
        res.render("admin/error");
      }
    },
    postAdminEditCategory:async(req,res)=>{
      try {
        const categoryId=req.query.categoryid
        const currentCategoryName=req.query.categoryname
        // console.log(categoryId)
        // console.log(currentCategoryName)
        // console.log(req.body)
        const {categoryName,description,offer}=req.body
        if(categoryName && description){
            if(req.files.length === 0){
                const category=await categoryCollection.findByIdAndUpdate(categoryId,req.body,{
                    upsert:true,
                    new:true,
                    runValidators:true
                })
               
                // await productsCollection.updateMany({categoryName:currentCategoryName,offer:{$gt:offer}}, 
                //     [{$set:{discountPrice:{$round:[{$subtract:["$price",{$divide:[{$multiply:["$price","$offer"]},100]}]}]}}}]).then((change)=>{
                //         console.log(change)
                //     })
                await productsCollection.updateMany({categoryName:currentCategoryName,offer: { $gt: offer },},[{$set: {discountPrice: {$round: [{$subtract: ["$price",{$divide: [{ $multiply: ["$price", "$offer"] }, 100], },],},],}, }, },])
                .then((change)=>{
                    console.log(change)
                    // console.log("if gt product offer")
                });
                await productsCollection.updateMany({categoryName:currentCategoryName,offer: { $lt: offer },},[{$set: {discountPrice: {$round: [{$subtract: ["$price",{$divide: [{ $multiply: ["$price", Number(offer)] }, 100], },],},],}, }, },])
                .then((change)=>{
                    console.log(change)
                    // console.log("if lt product offer")
                });
                    res.redirect("/admincategory")
            }else{
                var img=[];
                req.files.forEach((element)=>{
                    img.push(element.filename)
                })
                Object.assign(req.body,{
                    imageUrl:img,
                })
                const category=await categoryCollection.findByIdAndUpdate(categoryId,req.body,{
                    upsert:true,
                    new:true,
                    runValidators:true
                })
                await productsCollection.updateMany({categoryName:currentCategoryName,offer: { $gt: offer },},[{$set: {discountPrice: {$round: [{$subtract: ["$price",{$divide: [{ $multiply: ["$price", "$offer"] }, 100], },],},],}, }, },])
                .then((change)=>{
                    console.log(change)
                    // console.log("if gt product offer")
                });
                await productsCollection.updateMany({categoryName:currentCategoryName,offer: { $lt: offer },},[{$set: {discountPrice: {$round: [{$subtract: ["$price",{$divide: [{ $multiply: ["$price", Number(offer)] }, 100], },],},],}, }, },])
                .then((change)=>{
                    console.log(change)
                    // console.log("if lt product offer")
                });
                    res.redirect("/admincategory")
                
            }
        }else{
          req.flash("editCatErr","Fill all columns")
           res.redirect("/admineditcategory?categoryid="+categoryId)
        }
      } catch (error) {
        res.render("admin/error");
      }
    },
    getAdminAddCoupon:(req,res)=>{
      try {
        res.render("admin/adminaddcoupon",{
            couponAddErr:req.flash("couponAddErr"),
            couponAddExistErr:req.flash("couponAddExistErr")
        })
      } catch (error) {
        res.render("admin/error");
      }
    },
    postAdminAddCoupon:async(req,res)=>{
      try {
        const {code,cutOff,minAmount,maxAmount,generateCount,expireDate}=req.body
        console.log(req.body)
        if(code && cutOff && minAmount && maxAmount && generateCount && expireDate){
            let  regExp= new RegExp(code,"i")
            const coupon =await couponCollection.find({code:{$regex:regExp}})
            if(coupon.length == 0){
                new couponCollection({
                    code:code,
                    cutOff:cutOff,
                  
                    minCartAmount:minAmount,
                    maxRedeemAmount:maxAmount,
                    generateCount:generateCount,
                    expireDate:expireDate
                })
               .save().then((result)=>{
                res.redirect("/coupon")
              })

            }else{
              req.flash("couponAddExistErr","Coupon with this code already exist")
              res.redirect("/adminaddcoupon")
               
            }
        }else{
          req.flash("couponAddErr","Fill all columns")
          res.redirect("/adminaddcoupon")
           
        }
      } catch (error) {
        res.render("admin/error");
      }
    },
    getAdminOrders: async (req, res) => {
        try {
          let order = await orderCollection.find().sort({ updatedAt: -1 }).populate("userId");
          Object.values(order);
        //   console.log(order)
          res.render("admin/adminorders", {
            order,
            user: req.session.user
            
          });
        } catch (error) {
          res.render("admin/error");
        }
      },
      getAdminOrderDetails:async (req, res) => {
        try {
            console.log(req.query.orderid)
          let order = await orderCollection.findOne({ _id: req.query.orderid}).populate(
            "products.product"
          );
          res.render("admin/adminorderdetails1", { order});
        } catch (error) {
          res.render("admin/error");
        }
      },
      postChangeTrack :async (req, res) => {
        try {
         let orderId = req.body.orderId;
         let value = req.body.value;
          if (value == "Delivered") {
            await orderCollection.updateOne(
              {
                _id: orderId,
              },
              {
                $set: {
                  track: value,
                  orderStatus: value,
                  paymentStatus: "paid",
                },
              }
            ).then((response) => {
              res.json({ status: true });
            });
          } else {
            await orderCollection.updateOne(
              {
                _id: orderId,
              },
              {
                $set: {
                  track: value,
                  orderStatus: value,
                },
              }
            ).then((response) => {
              res.json({ status: true });
            });
          }
        } catch (error) {
          res.render("admin/error");
        }
      },
      getAdminReturnApprove:async(req,res)=>{
        try {
        let orderId=req.query.orderid
        // console.log(orderId)
        await orderCollection.findByIdAndUpdate(orderId,
             {$set:{returnApprove:true}}

         ).then((result) => {
            console.log(result)
            
            const findProductId = result.products;
          findProductId.forEach(async (element) => {
            let removeQuantity = await productsCollection.findOneAndUpdate(
              { _id: element.product },
              { $inc: { stock: element.quantity } }
            );
          });
            
           res.redirect("/adminorders")
          });
        } catch (error) {
          res.render("admin/error");
        }
      },
    getAdminCoupon:async(req,res)=>{
      try {
        const coupons= await couponCollection.find().sort({timestamp:-1})
        res.render("admin/admincoupon",{
            coupons
        })
      } catch (error) {
        res.render("admin/error");
      }
    },
    getAdminCouponActivate:async(req,res)=>{
      try {
        couponId=req.query.couponid
        // console.log(couponId)
        await couponCollection.updateOne({_id:couponId},{$set:{status:"ACTIVE"}})
        .then((result)=>{
            res.redirect("/admincoupons")
        })
      } catch (error) {
        res.render("admin/error");
      }
    },
    getAdminCouponRevoke:async(req,res)=>{
      try {
        couponId=req.query.couponid
        // console.log(couponId)
        await couponCollection.updateOne({_id:couponId},{$set:{status:"INACTIVE"}})
        .then((result)=>{
            res.redirect("/admincoupons")
        })
      } catch (error) {
        res.render("admin/error");
      }
    },
    getAdminAddBanner:(req,res)=>{
      try {
        res.render("admin/adminaddbanner",{
          bannerAddErr:req.flash("bannerAddErr")
        })
      } catch (error) {
        res.render("admin/error");
      }
    },
    getAdminBanners:async(req,res)=>{
      try {
        const banners=await bannerCollection.find({}).sort({createdAt:-1})
        // console.log(banners)
        res.render("admin/adminbanners",{banners})
      } catch (error) {
        res.render("admin/error");
      }
    },
    postAdminAddBanner:async(req,res)=>{
      try {
        const{head1,head2,head3,offer,description,route}=req.body
        const imageUrl=req.files
        // console.log(req.files)
        // console.log(imageUrl[0].filename)
        if(head1 && imageUrl && route){
           Object.assign(req.body,{imageUrl:imageUrl[0].filename})
           await new bannerCollection(req.body)
           .save().then((result)=>{
            res.redirect("/adminbanners")
           })
        }else{
          req.flash("bannerAddErr","Fill all columns")
          res.redirect("/adminaddbanner")
           
        }
      } catch (error) {
        res.render("admin/error");
      }
    },
    getAdminBannerActivate:async(req,res)=>{
      try {
        const bannerId=req.query.bannerid
       const newBanner= await bannerCollection.findByIdAndUpdate(bannerId,{$set:{delete:false}})
        newBanner.save().then(()=>{
            res.redirect("/adminbanners")
        })
      } catch (error) {
        res.render("admin/error");
      }
    },
    deleteAdminBanner:async(req,res)=>{
      try {
        const bannerId=req.query.bannerid
        console.log(bannerId)
       const newBanner=await bannerCollection.findByIdAndUpdate(bannerId,
            {$set:{delete:true}})
            newBanner.save().then(()=>{
                res.json("success")
            })
          } catch (error) {
            res.render("admin/error");
          }
    },
    getAdminDashboard:async(req,res)=>{
      try {
        let order = await orderCollection.find();
        let orderCount = order.length;
        let user = await userCollection.find();
        let usersCount = user.length;
        const total = await orderCollection.aggregate([
          {
            $group: {
              _id: order._id,
              total: {
                $sum: "$total",
              },
            },
          },
        ]);
        const totalProfit = total[0].total;
      
           let pending=await orderCollection.aggregate([
          {
            $match: {
              paymentStatus: "Pending",
            },
          },
          {
            $count: "Count",
          },
        ])
        let pendingCount
        if (pending.length != 0) {
         pendingCount = pending[0].Count;
        }
        res.render("admin/admindashboard",{
          order,
          orderCount,
          usersCount,
          totalProfit,
          pendingCount,
          dashboard: true,
        })
      } catch (error) {
        res.render("admin/error");
      }
    },
    getAdminChartDetails:async(req,res)=>{
        try{
            const value = req.query.value;
            var date = new Date();
            var month = date.getMonth();
            var year = date.getFullYear();
            let sales = [];
            if (value == 365) {
              console.log("year")
              year = date.getFullYear();
              var currentYear = new Date(year, 0, 1);
              let salesByYear = await orderCollection.aggregate([
                {
                  $match: {
                    createdAt: { $gte: currentYear },
                    orderStatus: { $eq: "Delivered" },
                  },
                },
                {
                  $group: {
                    _id: { $dateToString: { format: "%m", date: "$createdAt" } },
                    totalPrice: { $sum: "$total" },
                    count: { $sum: 1 },
                  },
                },
                { $sort: { _id: 1 } },
              ]);
              for (let i = 1; i <= 12; i++) {
                let result = true;
                for (let k = 0; k < salesByYear.length; k++) {
                  result = false;
                  if (salesByYear[k]._id == i) {
                    sales.push(salesByYear[k]);
                    break;
                  } else {
                    result = true;
                  }
                }
                if (result) sales.push({ _id: i, totalPrice: 0, count: 0 });
              }
              var lastYear = new Date(year - 1, 0, 1);
               let salesData=[]
              for (let i = 0; i < sales.length; i++) {
                salesData.push(sales[i].totalPrice);
              }
              res.json({ status: true, sales:salesData})
            } else if (value == 30) {
        
        
              console.log("month");
              let firstDay = new Date(year, month, 1);
              firstDay = new Date(firstDay.getTime() + 1 * 24 * 60 * 60 * 1000);
              let nextWeek = new Date(firstDay.getTime() + 7 * 24 * 60 * 60 * 1000);
             
              for (let i = 1; i <= 5; i++) {
                let abc = {};
                let salesByMonth = await orderCollection.aggregate([
                  {
                    $match: {
                      createdAt: { $gte: firstDay, $lt: nextWeek },
                      orderStatus: { $eq: "Delivered" },
                    },
                  },
                  {
                    $group: {
                      _id: moment(firstDay).format("DD-MM-YYYY"),
                      totalPrice: { $sum: "$total" },
                      count: { $sum: 1 },
                    },
                  },
                ]);
                if (salesByMonth.length) {
                  sales.push(salesByMonth[0]);
                } else {
                  (abc._id = moment(firstDay).format("DD-MM-YYYY")),
                    (abc.totalPrice = 0);
                  abc.count = 0;
                  sales.push(abc);
                }
          
                firstDay = nextWeek;
                if (i == 4) {
                  nextWeek = new Date(
                    firstDay.getFullYear(),
                    firstDay.getMonth() + 1,
                    1
                  );
                } else {
                  nextWeek = new Date(
                    firstDay.getFullYear(),
                    firstDay.getMonth() + 0,
                    (i + 1) * 7
                  );
                }
              }
           
                let salesData=[]
              for (let i = 0; i < sales.length; i++) {
                salesData.push(sales[i].totalPrice);  
              }
              res.json({ status: true, sales:salesData})
            } else if (value == 7) {
        console.log("week")
              let today = new Date();
              let lastDay = new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000);
              for (let i = 1; i <= 7; i++) {
                let abc = {};
                let salesByWeek = await orderCollection.aggregate([
                  {
                    $match: {
                      createdAt: { $lt: today, $gte: lastDay },
                      orderStatus: { $eq: "Delivered" },
                    },
                  },
                  {
                    $group: {
                      _id:  moment(today).format("DD-MM-YYYY"),
                      totalPrice: { $sum: "$total" },
                      count: { $sum: 1 },
                    },
                  },
                ]);
                if (salesByWeek.length) {
                  sales.push(salesByWeek[0]);
                } else {
                  abc._id = today.getDay() + 1;
                  abc.totalPrice = 0;
                  abc.count = 0;
                  sales.push(abc);
                }
        
                
                today = lastDay;
                lastDay = new Date(
                  new Date().getTime() - (i + 1) * 24 * 60 * 60 * 1000
                );
              }
             
             let salesData=[]
              for (let i = 0; i < sales.length; i++) {
                salesData.push(sales[i].totalPrice);
                
              }
          
        
              res.json({ status: true,sales: salesData})
            }
          } catch (error) {
            res.render("admin/error");
          }
    },
    getAdminSalesReport:async(req,res)=>{
      try {
        const salesReport = await orderCollection.aggregate([
          {
            $match: { orderStatus: { $eq: "Delivered" } },
          },
          {
            $group: {
              _id: {
                month: { $month: "$createdAt" },
                day: { $dayOfMonth: "$createdAt" },
                year: { $year: "$createdAt" },
              },
              totalPrice: { $sum: "$total" },
              products: { $sum: { $size: "$products" } },
              count: { $sum: 1 },
            },
          },
          { $sort: { date: -1 } },
        ]);
    
        // const filterOrder = await Order.find({})
        res.render("admin/adminsalesreport1", { salesReport });
      } catch (error) {
        res.render("admin/error");
      }
    },
    getAdminMonthReport:async(req,res)=>{
      try{
        const months = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];
        const salesReport = await orderCollection.aggregate([
          {
            $match: { orderStatus: { $eq: "Delivered" } },
          },
          {
            $group: {
              _id: { month: { $month: "$createdAt" } },
              totalPrice: { $sum: "$total" },
              products: { $sum: { $size: "$products" } },
              count: { $sum: 1 },
            },
          },
          { $sort: { date: -1 } },
        ]);
        const newSalesReport = salesReport.map((el) => {
          let newEl = { ...el };
          newEl._id.month = months[newEl._id.month - 1];
          return newEl;
        });
        res.render("admin/adminmonthreport", { salesReport: newSalesReport });
      } catch (error) {
        res.render("admin/error");
      }
    },
    getAdminYearReport:async(req,res)=>{
      try {
        const salesReport = await orderCollection.aggregate([
          {
            $match: { orderStatus: { $eq: "Delivered" } },
          },
          {
            $group: {
              _id: { year: { $year: "$createdAt" } },
              totalPrice: { $sum: "$total" },
              products: { $sum: { $size: "$products" } },
              count: { $sum: 1 },
            },
          },
          {
            $sort: {
              createdAt: -1,
            },
          },
        ]);
    
        // const filterOrder = await Order.find({})
        res.render("admin/adminyearreport", { salesReport });
      } catch (error) {
        res.render("admin/error");
      }
    },
    getAdminLogout:(req,res)=>{
      try {
        req.session.destroy()
        res.redirect("/adminlogin")
      } catch (error) {
        res.render("admin/error");
      }
    },
    getErrorPage:(req,res)=>{
        res.render("admin/error")
    }
}

