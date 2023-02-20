const userCollection=require("../model/userModel")
const productsCollection=require("../model/productModel")
const cartCollectiion=require("../model/cartModel")
const categoryCollection=require("../model/categoryModel")
const addressCollection=require("../model/addressModel")
const couponCollection=require("../model/couponModel")
const orderCollection=require("../model/orderModel")
const bannerCollection=require("../model/bannerModel")
const reviewsCollection = require("../model/reviewModel");
const {productsPagination}=require("../middlewares/pagination")
const bcrypt=require('bcrypt')
require("dotenv")
const {sendOtp,verifyOtp} = require("../config/otp");
const { default: mongoose } = require("mongoose")
const { all } = require("promise")
const moment=require("moment")
const paypal = require("@paypal/checkout-server-sdk");

const environment =
  process.env.NODE_ENV === "production"
    ? paypal.core.LiveEnvironment
    : paypal.core.SandboxEnvironment;

const paypalCliend = new paypal.core.PayPalHttpClient(
  new environment(process.env.PAYPAL_CLIEND_ID, process.env.PAYPAL_SECRET_ID)
);

module.exports={
    getAbout:async(req,res)=>{
        try {
            const categoryCount=(await categoryCollection.find({})).length
            const productCount=(await productsCollection.find({})).length
            const products=await productsCollection.find({})
            const brands=[]
            products.forEach((element)=>{
                brands.push(element.brand)
            })
            // console.log(brands)
           const brandCount=([...new Set(brands)]).length
          
        res.render("user/about",{
            user:req.session.user,
              categoryCount,
              productCount,
              brandCount
      })
    } catch (error) {
        res.render("user/error");
      }
    },
    getContact:(req,res)=>{
        try {
        res.render("user/contact",{user:req.session.user})
    } catch (error) {
        res.render("user/error");
      }
    },
    getHomeHandler:async(req,res)=>{
        try {
        let latestProducts=await productsCollection.find().sort({updatedAt:-1}).limit(5)
        let banners=await bannerCollection.find({delete:{$ne:true}})
        let popularProducts=await productsCollection.find().sort({review:-1}).limit(3)
        // console.log(popularProducts)
        res.render("user/home",{
            user:req.session.user,
            popularProducts,
            latestProducts,
            banners
        })
    } catch (error) {
        res.render("user/error");
      }
    },
    getLoginHandler:(req,res)=>{
        try {
        res.render("user/login",{
            user:req.session.user,
            emailErr:req.flash("emailErr"),
            passErr:req.flash("passErr"),
            fillErr:req.flash("fillErr"),
        })
    } catch (error) {
        res.render("user/error");
      }
    },
    getRegisterHandler:(req,res)=>{
        try {
        res.render("user/register",{
            user:req.session.user,
            registerErr:req.flash("registerErr"),
            existErr:req.flash("existErr")
        })
    } catch (error) {
        res.render("user/error");
      }
    },
    getLogout:(req,res)=>{
        try {
        req.session.destroy();
        res.redirect("/")
    } catch (error) {
        res.render("user/error");
      }
    },
    getCategoryProducts:async(req,res)=>{
        try {
        const category=req.query.category
        // console.log(category)
        const categoryProducts=await productsCollection.find({categoryName:category})
        // console.log(categoryProducts)
        res.render("user/categoryproducts",{
            categoryProducts,
            category,
            user:req.session.user
        })
    } catch (error) {
        res.render("user/error");
      }
    },
    postLogin:async(req,res)=>{
        try {
       const {email,password}=req.body
       if (email && password) {
       const user=await userCollection.findOne({email:email})
       // const hashedpassword=await bcrypt.hash(password,10)
       if (user){
        await bcrypt.compare(password,user.password,(err,data)=>{
                if(err){
                    console.log(err)
                }else if(data===true){
                    if(user.block===false){
                        req.session.loggedIn=true;
                        req.session.user=user
                        res.redirect("/")
                    }else{
                        res.render("user/userblocked")
                    }
                }else{
                    console.log("password not match")
                    req.flash("passErr", "password not match");
                    res.redirect("/login")
                }
            })
        }else{
            console.log("no user with this email ")
            req.flash("emailErr", "email not match");
            res.redirect("/login")
        }
    } else {
        req.flash("fillErr", "fill the columns");
        res.redirect("/login");
      }
    } catch (error) {
        res.render("user/error");
      }
    },

    postregister :async (req, res) => {
        try {
        const {name,email,phone,password,repassword} = req.body;
        // const hashedpassword = await bcrypt.hash(req.body.password, 10);
        // const hashedconfirmpassword = await bcrypt.hash(req.body.confirmpassword, 10);
        
        // req.session.user = req.body;
        const user = await userCollection.findOne({ email: email });
      
        if (user) {
            req.flash("existErr","account with this email already exist")
           return res.redirect("/register");
        } else if(name && phone && email && password && repassword) {
            if(password===repassword){
                req.session.user = req.body;
                sendOtp(phone);
                res.redirect("/otp")
            }
            // else{
            //     console.log("confirm password")
            //     res.redirect("/register");
            // }
            // userdata = usersignupdb({
            //     fullname: req.body.fullname,
            //     email: req.body.email,
            //     mobilenumber: req.body.mobilenumber,
            //     password: hashedpassword,
            //     confirmpassword: hashedconfirmpassword,
            // });
            // await userdata.save();
          
            
            // res.render("user/otp",{phone:phone});
        
           
        } else{
            req.flash("registerErr","fill all details")
            res.redirect("/register")
           
        }
    } catch (error) {
        res.render("user/error");
      }
    },




     postOtp: async (req, res) => {
        try {
            // console.log(req.session.register);
            // console.log(req.session.user);
            const { name, email, phone, password,username} = req.session.user;
            // console.log(name)
            // console.log(req.session.register);
            const otp = req.body.otp;
            // console.log(phone);
            // console.log(otp);
            // console.log(req.session.user)
            await verifyOtp(phone, otp).then(async (verification_check) => {
                // console.log(verification_check.status)
                if (verification_check.status == "approved") {
                    // console.log(password);
                    const hashedpassword = await bcrypt.hash(password, 10);
                    // const hashedconfirmpassword = await bcrypt.hash(confirmpassword, 10);
                    // console.log("otp verifying");
                     await userCollection({
                        name:name,
                        email:email,
                        phonenumber:phone,
                        password: hashedpassword,
                        username:username
                        
                    }).save().then((response)=>{
                        // console.log(response)
                        req.session.user=response
                        req.session.loggedIn=true;
                        req.session.otpverified = true;
                        res.redirect("/");
                    })
                    // .then((response) => {
                    //     req.session.user_detail = response;
                    //     console.log(response)
                    // });
                    
                    // console.log("otp verified but.....")
                  
                } else {
                    req.flash("otpErr", "OTP NOT MATCH");
                    // console.log("flash set");
                    res.redirect("/otp");
                }
            });
        } catch (error) {
            res.render("user/error");
        }
    },

    getOtp:(req,res)=>{
        try {
        // console.log("for render otp page");
        const {phone}=req.session.user
        // console.log(phone)
       
        res.render("user/otp",{phone:phone, otpErr: req.flash("otpErr")})
    } catch (error) {
        res.render("user/error");
      }
    },

    getResendOtp:(req,res)=>{
        try {
        const {phone}=req.session.user
        // console.log(phone);
        // console.log("before resending");
        sendOtp(phone)
        res.redirect("/otp")
    } catch (error) {
        res.render("user/error");
      } 
    },




    
    getCart:async(req,res)=>{
        try {
        // console.log("in getcart");
        // console.log(req.session.user);
      const currentUserId=req.session.user._id;
    //   console.log(currentUserId);
      await cartCollectiion.findOne({owner:currentUserId})
      .populate("items.product")
      .exec((err,allCart)=>{
        if(err){
            console.log("error occured")
            return console.log(err)
        }else{
            if(allCart==null){
                res.render("user/cartempty",
                {user:req.session.user})
            }
           else if(allCart.items.length > 0){
                // console.log(allCart)
                res.render("user/cart",{
                    allCart,
                    user:req.session.user,
                    notAvailable:req.flash("notAvailable")
                    // cartView:true
                })
            }else{
                res.render("user/cartempty",
                {user:req.session.user})
            }
        }
      })
    } catch (error) {
        res.render("user/error");
      }
    },
    getProducts:async(req,res)=>{
        try {
        // const products=await productsCollection.find({})
        const products=res.productsPagination
        const categories=await categoryCollection.find({})
        // console.log(products)
        res.render("user/products",{
            products,
            categories,
            user:req.session.user
        })
    } catch (error) {
        res.render("user/error");
      }
    },
     getProduct:async(req,res)=>{
        try {
        // console.log("getProduct reach")
        const productId=req.query.productid;
        // console.log(productId)
        const product=await productsCollection.findById(productId)
        // console.log(product);
        let reviews= await reviewsCollection.find({ product: productId }).populate("user");
        res.render("user/productdetails",{
            product,
            reviews,
            user:req.session.user,
            productId
        })
    } catch (error) {
        res.render("user/error");
      }
    },
    postAddToCart:async(req,res)=>{
        try {
        // console.log("add to cart reached but...");
       const productId=req.query.productid
    //    console.log(productId)
    //  console.log( req.session.user) 
    const currentUserId=req.session.user._id;
    // console.log(currentUserId);
    const currentUserCart=await cartCollectiion.findOne({owner:currentUserId})
    const product=await productsCollection.findOne({_id:productId})
    let price;
    if(product.discountPrice<product.price){
        price=product.discountPrice
    }else{
        price=product.price
    }
    if(product.stock < 1){
        res.json({noAvailablity:true})
    }else{
        // console.log(currentUserCart);
        // const cartTotal=price
        if(!currentUserCart){
            // console.log("adding to cart");
            await cartCollectiion({
                owner:currentUserId,
                items:[{product:productId,totalPrice:price}],
                cartTotalPrice:price
            }).save().then(()=>{
                // res.redirect("/product" + productId )
                // console.log("first adding product to cart");
                res.json({productAdded:true})
            })
        }else {
           const existProduct = await cartCollectiion.findOne({
            owner:currentUserId,
            "items.product":productId
        })
        if(existProduct){
            // console.log("if the user have cart and have the current product in the cart")
            const proQuantity=await cartCollectiion.aggregate([
                {$match:{owner:mongoose.Types.ObjectId(currentUserId)}},
                {$project:{items:{$filter:{input:"$items",cond:{$eq:["$$this.product",mongoose.Types.ObjectId(productId)]}}}}}
               ])
               const quantity = proQuantity[0].items[0].quantity
               if(product.stock <= quantity){
               res.json({stockReached:true})
              }else{
                  await cartCollectiion.findOneAndUpdate(
                    {owner:currentUserId,"items.product":productId},
                    {$inc:{"items.$.quantity":1,"items.$.totalPrice":price,cartTotalPrice:price,subTotalPrice:price}})
                    .then(()=>{
                        // console.log("json sending")
                    // res.redirect("/product" + productId)
                    res.json({productAdded:true})
                   })
             }
        }else{
            // console.log("if the user have cart and not have the current product");
            await cartCollectiion.findOneAndUpdate(
                {owner:currentUserId},
                {$push:{items:{product:productId,totalPrice:price}},$inc:{cartTotalPrice:price,subTotal:price}}
            ).then(()=>{
                // res.redirect("/product" + productId)
                res.json({productAdded:true})
            })
        }
    }
}
} catch (error) {
    res.render("user/error");
  }
    },

    patchCartQuantity:async(req,res)=>{
        try {
        console.log('reached patchquantity')
        const {cartId,productId,count}=req.query
        // console.log(req.query)
        const product=await productsCollection.findOne({_id:productId})
        let price;
        if(product.discountPrice<product.price){
            price=product.discountPrice
        }else{
            price=product.price
        }
        let productPrice;
        if(count==1){
            productPrice = price
        }else{
            productPrice = -price
        }
        const currentUserId=req.session.user._id;
        // console.log(currentUserId)
        const proQuantity=await cartCollectiion.aggregate([
            {$match:{owner:mongoose.Types.ObjectId(currentUserId)}},
            {$project:{items:{$filter:{input:"$items",cond:{$eq:["$$this.product",mongoose.Types.ObjectId(productId)]}}}}}
           ])
        //    console.log(proQuantity)
           const quantity= proQuantity[0].items[0].quantity
        //    console.log(quantity)
           if(product.stock <= quantity && count==1){
            res.json({ stockReached: true})
           }else{
            // console.log("cart changing reached but......")
            // console.log(count,productPrice)
            await cartCollectiion.findOneAndUpdate(
                {_id:cartId, "items.product":productId},{$inc:{
                    "items.$.quantity":count,
                    "items.$.totalPrice":productPrice,
                cartTotalPrice:productPrice}}
            ).then(()=>{
                res.json()
            })
           }
        } catch (error) {
            res.render("user/error");
          }
    },
    deleteCartProduct:async(req,res)=>{
        try {
        console.log("here in deleting cart product");
        const currentUserId =req.session.user._id
        const productId=req.query.productid
        const cart=await cartCollectiion.findOne({owner:currentUserId})
        const index=await cart.items.findIndex((element)=>{
            return element.product == productId
        })
        const totalPrice=cart.items[index].totalPrice
        const deleteProduct=await cartCollectiion.findOneAndUpdate(
            {owner:currentUserId},
            {$pull:{items:{product:productId}},$inc:{cartTotalPrice: -totalPrice}})
            deleteProduct.save().then(()=>{
                res.json("success")
            })
        } catch (error) {
            res.render("user/error");
          }
    },
    getProfile:async(req,res)=>{
        try {
        const currentUserId=req.session.user._id
        // const user=await userCollection.findById(currentUserId)
        const userData=await userCollection.findById(currentUserId)
        const addresses=await addressCollection.findOne({userId:currentUserId})
        let address;
        if(addresses){
            address=addresses.address
        }else{
            address=[]
        }
        res.render("user/profile",
        {  
             address,
            addresses,
            user:req.session.user,
            moment:moment,
            userData
        })
    } catch (error) {
        res.render("user/error");
      }
    },
    postProfileEdit:async(req,res)=>{
        try {
        const {username,email,phone}=req.body
        // console.log(req.body)
        // console.log(req.files)
         if(username,email,phone){
            if(req.files.length==0){
                console.log("no image")
                await userCollection.findByIdAndUpdate(req.session.user._id,req.body,{
                    upsert:true,
                    new:true,
                    runvalidators:true
                }).then((response)=>{
                    console.log(response)
                    req.session.user=response
                })
          }else{
            let img=[]
            req.files.forEach((element)=>{
                img.push(element.filename)
            })
            Object.assign(req.body,{imageUrl:img})
            await userCollection.findByIdAndUpdate(req.session.user._id,req.body,{
                upsert:true,
                        new:true,
                        runValidators:true,
               })
               .then((response)=>{
                console.log(response)
                req.session.user=response
                
               })
        }
        res.redirect("/profile")
    }
} catch (error) {
    res.render("user/error");
  } 
    },
    getAddAddress:async(req,res)=>{
        try {
        const currentUserId=req.session.user._id
        // const user=await userCollection.findById(currentUserId)
        res.render("user/addaddress",
        {
            user:req.session.user,
            moment:moment,
            addressErr:req.flash("addressErr")
        })
    } catch (error) {
        res.render("user/error");
      }
    },
    postAddAddress:async(req,res)=>{
        try {
        console.log(req.body)
        const {country,firstName,state,addressLine,city,pinCode,addressType}=req.body;
        if(country && firstName && state && addressLine && city && pinCode && addressType){
            let userId= req.session.user._id;
            const currentAddress= await addressCollection.findOne({userId:userId});
            if(currentAddress){
                await addressCollection.findOneAndUpdate(
                    {userId:userId},
                    {$push:{address:[req.body]}}
                ).then(()=>{
                    res.redirect("profile")
                })
            }else{
                await addressCollection({
                    userId:userId,
                    address:[req.body]
                }).save().then(()=>{
                    res.redirect("profile")
                })
            }
        }else{
            req.flash("addressErr","Fill all columns")
            res.redirect("/address")
            
        }
    } catch (error) {
        res.render("user/error");
      }
    },
    deleteAddress:async(req,res)=>{
        try {
        const currentUserId=req.session.user._id
       const addressId=req.query.addressid
       await addressCollection.updateOne(
        {userId:currentUserId},
        {$pull:{address:{_id:addressId}}}
       )
       res.json("success")
    } catch (error) {
        res.render("user/error");
      }
    },
    getEditAddress:async(req,res)=>{
        try {
        const addressId=req.query.addressid
        // console.log(addressId)
        let currentAddresses=await addressCollection.findOne({userId:req.session.user._id})
        // console.log(currentAddresses);
        // console.log(currentAddresses.address)
        const address=currentAddresses.address.find(
            (element)=> element._id.toString() === req.query.addressid
        )
    //    console.log(address)
        res.render("user/editaddress",
        {
            user:req.session.user,
            address,
            moment:moment,
            editAddressErr:req.flash("editAddressErr")
        })
    } catch (error) {
        res.render("user/error");
      }
    },
    postEditAddress:async(req,res)=>{
        try {
        const {country,firstName,state,addressLine,city,pinCode,addressType}= req.body
        if(country && firstName && state && addressLine && city && pinCode && addressType){
            const addressId=req.query.addressid
            console.log(addressId)
            await addressCollection.updateMany(
                {"address._id":addressId},
                {$set:{
                    "address.$.firstName":firstName,
                    "address.$.country":country,
                    "address.$.state":state,
                    "address.$.addressLine":addressLine,
                    "address.$.city":city,
                    "address.$.pinCode":pinCode,
                    "address.$.addressType":addressType
                },
                new:true,
            },
            {upsert:true}
            )
            res.redirect("/profile")
        }else{
            req.flash("editAddressErr","Fill all columns")
            res.redirect("/editaddress?addressid="+req.query.addressid)
        }
    } catch (error) {
        res.render("user/error");
      }
    },
    getCheckout:async(req,res)=>{
        try {
        // console.log(req.body)
        let index=Number(req.body.index)
        if(!index){
            index=0
        }
        
        const currentUserId=req.session.user._id
        const userData=await userCollection.findById(currentUserId)
        const addresses=await addressCollection.findOne({userId:currentUserId})
        let address;
        if(addresses){
            address=addresses.address
        }else{
            address=[]
        }
        const cartItems= await cartCollectiion.findOne({owner:currentUserId}).populate(
            "items.product"
        )
        // console.log(cartItems)
        let check=false
        let checkoutProducts=[]
        for (let i=0; i < cartItems.items.length; i++){
            if(cartItems.items[i].quantity > cartItems.items[i].product.stock){
                // console.log(cartItems.items[i].product.stock)
                check=true;
                checkoutProducts.push(cartItems.items[i].product.productName)
            }
        }
        // console.log(checkoutProducts)
        if(check == true){
            req.flash("notAvailable",checkoutProducts + " not in stock")
             res.redirect("/cart")
        }else{
            if(cartItems){
                res.render("user/checkout",
                {
                    userData,
                    user:req.session.user,
                    address,
                    index,
                    cartItems,
                    addAddressErr:req.flash("addAddressErr"),
                    clientId:process.env.PAYPAL_CLIEND_ID
                })
            }
        }
    } catch (error) {
        res.render("user/error");
      }
    },
    postCheckout:async(req,res)=>{
        try {
        console.log(req.body)
        console.log(req.params.CartId)
        if(req.body.address){
            let user=req.session.user;
            let currentUserId=user._id;
            let subTotal=req.body.subtotal
            let total=req.body.total

            let coupon =await couponCollection.findOne({code:req.body.couponCod})
        
            if(coupon){
                var couponDiscount=Number(subTotal-total)
                console.log(couponDiscount)
            }
            const paymentMethod= req.body.paymentMethod
            let address = await addressCollection.findOne({userId:currentUserId})
            // console.log(address)
            const deliveryAddress = address.address.find(
                (element)=> element._id.toString()=== req.body.address
            )
            let cart = await cartCollectiion.findById(req.body.cartId)
            let proId = cart.items.product
            console.log("before paymentmethod")
            console.log(proId,"hi")
            if(req.body.paymentMethod ==="cash on delivery"){
                console.log("cash on delivery")
                // console.log(deliveryAddress)
                // console.log(paymentMethod)
                // console.log(couponDiscount)
                await orderCollection({
                    date:new Date(),
                    time:new Date().toLocaleTimeString(),
                    userId:currentUserId,
                    products:cart.items,
                    couponDiscount:couponDiscount,
                    total:total,
                    address:deliveryAddress,
                    paymentMethod:paymentMethod,
                    paymentStatus:"Pending",
                    orderStatus:"orderconfirmed",
                    track:"shipped"
                })
                .save().then(async(result)=>{
                    req.session.orderId = result._id
                    let order = await orderCollection.findOne({_id:result._id})
                    // console.log(order)
                    const findProductId=order.products
                    findProductId.forEach(async(element)=>{
                        // console.log("reducing the quantity from the productcollecion")
                        let removeQuantity =await productsCollection.findOneAndUpdate(
                            {_id:element.product},
                            {$inc:{stock:-element.quantity}}
                        )
                    })
                    if(coupon){
                        let cartCount =await couponCollection.findOneAndUpdate(
                            {_id:coupon._id},
                            {$inc:{generateCount:-1}}
                        )
                    }
                    await cartCollectiion.findOneAndRemove({owner:result.userId}).then(
                        (result)=>{
                            res.json({cashOnDelivery:true})
                        }
                    )
                })
            }else if(req.body.paymentMethod=="paypal"){
                console.log("paypal")

                const paymentMethod=req.body.paymentMethod;
                const newOrder = new orderCollection({
                    date:new Date(),
                    time:new Date().toLocaleTimeString(),
                    userId:currentUserId,
                    products:cart.items,
                    total:total,
                    address:deliveryAddress,
                    couponDiscount:couponDiscount,
                    paymentMethod:paymentMethod,
                    paymentStatus:"pending",
                    orderStatus:"ordernotconfirmed",
                    track:"ordernotconfirmed"
                })
                newOrder.save().then((result)=>{
                    let userOrderData=result
                    req.session.orderId=result._id;
                    id=result._id.toString()
                    let response= {
                        paypal:true,
                        userOrderData:userOrderData._id,
                        amount:total
                    }
                    res.json(response)
                })

            }else if(req.body.paymentMethod==="Wallet"){
                console.log("in wallet")
                user=await userCollection.findOne({_id:req.session.user._id})
                const walletBalance = user.wallet
                if(walletBalance <=0){
                    res.json({noBalance:true})
                }else {
                    if(walletBalance < total){
                        const balancePayment=total-walletBalance
                        const newOrder=await orderCollection({
                            date:new Date(),
                            time:new Date().toLocaleTimeString(),
                            userId:currentUserId,
                            products:cart.items,
                            total:total,
                            address:deliveryAddress,
                            couponDiscount:couponDiscount,
                            paymentMethod:paymentMethod,
                            paymentStatus:"pending",
                            orderStatus:"ordernotconfirmed",
                            track:"ordernotconfirmed"
                            })
                            newOrder.save().then(async(result)=>{
                                let userOrderData=result
                                req.session.orderId=result._id
                                id=result._id.toString()
                                let response={
                                    paypal:true,
                                    amount:balancePayment,
                                    walletAmount:walletBalance,
                                    userOrderData:userOrderData._id
                                }
                                res.json(response)
                            })
                    }else{
                        const newOrder =await orderCollection({
                            date:new Date(),
                            time:new Date().toLocaleTimeString(),
                            userId:currentUserId,
                            products:cart.items,
                            total:total,
                            address:deliveryAddress,
                            couponDiscount:couponDiscount,
                            paymentMethod:paymentMethod,
                            paymentStatus:"paid",
                            orderStatus:"orderconfirmed",
                            track:"shipped"

                        })
                        newOrder.save().then(async(result)=>{
                            console.log("here in wallet payment")
                            req.session.orderId=result._id
                            const order=await orderCollection.findOne({_id:result._id})
                            const findProductId=order.products
                            findProductId.forEach(async(element)=>{
                                let updateProductData =await productsCollection.findOneAndUpdate(
                                    {_id:element.product},
                                    {$inc:{stock:-element.quantity}}
                                )
                            })
                            let orderWallet= await orderCollection.findByIdAndUpdate(
                                {_id:result._id},
                                {$set:{useWallet:total}}
                            )
                            let walletAmount=await userCollection.findOneAndUpdate(
                                {_id:currentUserId},
                                {$inc:{wallet:-total}}
                            )
                            if(coupon){
                                let cartCount=await couponCollection.updateMany(
                                    {_id:coupon._id},
                                    {$inc:{generateCount:-1}}
                                )
                            }
                            await cartCollectiion.findOneAndRemove(
                                {owner:result.userId}
                                ).then((result)=>{
                                    res.json({wallet:true})
                                })
                        })
                    }
                }
            }
       
        }else if(("address" in req.body)===false){
            res.json({chooseAddress:true})
             }
    } catch (error) {
        res.render("user/error");
      }
    },
   
      postVerifyPayment:async(req,res)=>{
        try {
        console.log("verifypayment")
        console.log(req.body)
        let userOrderDataId=req.body.userOrderData
        await orderCollection.findByIdAndUpdate(userOrderDataId,{
            orderStatus:"orderconfirmed",
            paymentStatus:"paid",
            track:"shipped"
        }).then(async(result)=>{
            if(result.paymentMethod=="Wallet"){
                await orderCollection.findByIdAndUpdate(
                    {_id:userOrderDataId},
                    {$set:{useWallet:req.body.walletBalance}})
                    let walletAmount =await userCollection.findByIdAndUpdate(
                        {_id:req.session.user._id},
                        {$inc:{wallet:-req.body.walletBalance}}
                    )
            }
            const findProductId=result.products
            findProductId.forEach(async(element)=>{
                let removeQuantity=await productsCollection.findOneAndUpdate(
                    {_id:element.product},
                    {$inc:{stock:-element.quantity}}
                )
            })
            let coupon = await couponCollection.findOne({code:req.body.CouponCode});
            console.log(coupon)
            if (coupon) {
              let cartCount = await couponCollection.findOneAndUpdate(
                { _id: coupon._id },
                { $inc: { generateCount: -1 } }
              ).then((res)=>{console.log(res)})
            }

            await cartCollectiion.findOneAndDelete({owner:req.session.user._id})
            .then((result)=>{
                res.json({status:true})
            })
        })
    } catch (error) {
        res.render("user/error");
      }
      },
      
      paypalOrder : async (req, res) => {
        try{
          const request = new paypal.orders.OrdersCreateRequest();
      
        //   console.log("////////");
        //   console.log(req.body.items[0].amount);
          const balance = req.body.items[0].amount;
        
        //   console.log("jj");
          request.prefer("return=representation");
          request.requestBody({
            intent: "CAPTURE",
            purchase_units: [
              {
                amount: {
                  currency_code: "USD",
                  value: balance,
        
                  breakdown: {
                    item_total: {
                      currency_code: "USD",
                      value: balance,
                    },
                  },
                },
              },
            ],
          });
          try {
            // console.log(",,,,,,,");
            const order = await paypalCliend.execute(request);
            // console.log(".........");
            console.log(order);
            // console.log(order.result.id);
            res.json({ id: order.result.id });
          } catch (e) {
            // console.log("....,.,mmm");
            // console.log(e);
            res.status(500).json(e);
          }
        }catch{
          res.render("/user/error");  
      
        }
      
      },
    postVerifyCoupon:async(req,res)=>{
        try {
         let couponcode=req.body.CouponCode
         let total =req.body.total
         let grandtotal;
         let couponMsg;
         let nowDate=moment().format("DD/MM/YYYY")
         let coupon= await couponCollection.find({
            code:couponcode,
            status:"ACTIVE"
         })
        //  console.log(coupon)
         if(coupon.length==0){
            couponMsg="Coupon Invalid"
            res.json({status:false, couponMsg})
         }else{
            let expireDate=coupon[0].expireDate.toLocaleDateString()
            // let couponType=coupon[0].couponType
            let cutOff= parseInt(coupon[0].cutOff)
            let maxRedeemAmount = parseInt(coupon[0].maxRedeemAmount);
            let minCartAmount = parseInt(coupon[0].minCartAmount)
            let generateCount = parseInt(coupon[0].generateCount);

            if(generateCount != 0){
                if(nowDate<expireDate){
                if(total < minCartAmount){
                    couponMsg =
              "Minimum Rs." + minCartAmount + "need to Apply this Coupon";
            res.json({ status: false, couponMsg });
                }else{
                    grandtotal= Math.round(total -cutOff)
                    let response= {
                        status:true,
                        grandtotal:grandtotal,
                        couponMsg,
                        CutOff:cutOff
                    }
                    res.json(response)
                }
            }else{
                couponMsg ="Coupon date expired"
                res.json({status:false,couponMsg})
            }
         }else{
            couponMsg = "Sorry,Coupon currently Out of Stock";
            res.json({ status: false, couponMsg });
         }
        }
    } catch (error) {
        res.render("user/error");
      }
    },
     getOrderComplete :async (req, res) => {
        try {
          res.render("user/order_confirm", { user: req.session.user });
        } catch (error) {
        res.render("user/error");
      }
      },
     
       getOrders:async (req, res) => {
        try {
            console.log(req.session.user)
          let orders = await orderCollection.find({ userId: req.session.user }).sort({
            updatedAt: -1,
          });
          res.render("user/orders", { user: req.session.user, orders ,moment:moment});
        } catch (error) {
        res.render("user/error");
      }
      },
      getOrderDetails:async (req, res) => {
        try {
          let orderDetails = await orderCollection.findOne({ _id: req.query.id }).populate(
            "products.product"
          );
        //   console.log(orderDetails)
          res.render("user/orderdetails1", {user:req.session.user, orderDetails,moment:moment });
        } catch (error) {
        res.render("user/error");
      }
      },
      getCancelOrder :async (req, res) => {
        try{
        let orderId = req.query.orderid;
        console.log(orderId)
      
        let currentOrder = await orderCollection.findByIdAndUpdate(orderId, {
          orderStatus: "Cancelled",
          track: "Cancelled",
        }).then((result) => {
          const findProductId = result.products;
          findProductId.forEach(async (element) => {
            let addQuantity = await productsCollection.findOneAndUpdate(
              { _id: element.product },
              { $inc: { stock: element.quantity } }
            );
          });
        });

        const order = await orderCollection.findOne({ _id: orderId }).populate("userId");
          if (order.userId.wallet === 0) {
            await userCollection.updateOne(
              { _id: order.userId },
              { $set: { wallet: order.total }, new: true },
              { upsert: true }
            );
          } else {
            await userCollection.findOneAndUpdate(
              { _id: order.userId },
              {
                $inc: {
                  wallet: order.total,
                },
              }
            );
          }



         } catch (error) {
        res.render("user/error");
      }
      },
       postReturnOrder :async (req, res) => {
        try{
            console.log(req.body)
        orderId = mongoose.Types.ObjectId(req.body.orderid.trim());
        reason = req.body.returnreason;
      
        await orderCollection.findByIdAndUpdate(orderId, {
          track: "Returnd",
          orderStatus: "Returnd",
          returnReason:reason,
        }).then((response) => {
          res.json({ status: true });
        });
      } catch (error) {
        res.render("user/error");
      }
      },
      postRequestRefund :async (req, res) => {
        try {
          orderId = req.query.orderid;
        //   console.log(orderId)
          const order = await orderCollection.findOne({ _id: orderId }).populate("userId");
          if (order.userId.wallet === 0) {
            await userCollection.updateOne(
              { _id: order.userId },
              { $set: { wallet: order.total }, new: true },
              { upsert: true }
            );
          } else {
            await userCollection.findOneAndUpdate(
              { _id: order.userId },
              {
                $inc: {
                  wallet: order.total,
                },
              }
            );
          }
          await orderCollection.findByIdAndUpdate(orderId, {
            paymentStatus: "Refunded",
          }).then((response) => {
            res.json({ status: true });
          });
        } catch (error) {
        res.render("user/error");
      }
      },
      postReview:async(req,res)=>{
        try {
            console.log(req.body)
            let { rating, review, product, title } = req.body;
            rating = rating * 20;
            Object.assign(req.body, { user: req.session.user._id ,rating:rating});
        console.log(req.body)

            reviewsCollection.findOneAndReplace({product:product,user:req.session.user._id},req.body).then(async result=>{
              if(result){
                let rat = {} = await productsCollection.findById(product, { _id: 0, rating: 1 ,review:1});
                rating=(rat.rating- result.rating+req.body.rating)
                  await productsCollection.findByIdAndUpdate(product,{$set:{rating:rating,}})
                  res.json();
        
              }else{
                const newReview = await new reviewsCollection(req.body);
                await newReview.save().then(async () => {
                  await productsCollection.findByIdAndUpdate(product, {
                    $inc: { review: 1 },
                    $set: { rating: rating },
                  });
                  res.json();
                });
        
              }
            })
        
          
          } catch (error) {
          res.render("user/error");
        }
      },
      getErrorPage:(req,res)=>{
        res.render("user/error")
    }
   
    
   
}



  