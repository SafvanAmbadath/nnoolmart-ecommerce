const mongoose=require("mongoose")
const addressSchema=new mongoose.Schema ({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"userCollection"
    },
   address:[{
        addressType:{
            type:String
        },
        firstName:{
            type:String,
            required:true
        },
        pinCode:{
            type:Number,
            required:true
        },
        addressLine:{
            type:String,
            required:true
        },
        city:{
            type:String,
            required:true
        },
        state:{
            type:String,
            required:true
        },
        country:{
            type:String,
            required:true
        }
    }]
})

module.exports=mongoose.model("addressCollection",addressSchema)