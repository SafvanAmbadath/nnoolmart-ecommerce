const mongoose=require("mongoose")
const {isEmail}=require("validator")
const registerSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        validate:isEmail
    },
    phonenumber:{
        type:Number,
        required:true,
    },
    password:{
        type:String,
        required:true
    },
    block:{
        type:Boolean,
        default:false
    },
    imageUrl:{
        type:Array
    },
    wallet:{
        type:Number,
        default:0
    }
},
{timestamps:true}
)
module.exports=mongoose.model('userCollection',registerSchema)