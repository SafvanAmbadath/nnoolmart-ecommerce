const mongoose = require("mongoose")
const couponSchema= new mongoose.Schema({
    code:{
        type:String,
        required:true
    },
    cutOff:{
        type:Number,
        required:true
    },
    timestamp:{
        type:Date,
        default:new Date()
    },
    status:{
        type:String,
        default:"ACTIVE"
    },
   
    maxRedeemAmount:{
        type:Number,
        required:true
    },
    minCartAmount:{
        type:Number,
        required:true
    },
    generateCount:{
        type:Number,
        required:true
    },
    expireDate:{
        type:Date,
        required:true
    }
})

module.exports=mongoose.model("couponCollection",couponSchema)