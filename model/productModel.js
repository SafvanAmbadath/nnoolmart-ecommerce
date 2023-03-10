const mongoose=require('mongoose')
const {schema}=require("./userModel")

const productSchema=new mongoose.Schema({
    productName:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    stock:{
        type:Number,
        required:true
    },
    categoryName:{
        type:String,
        required:true
    },
    imageUrl:{
        type:Array,
        required:true
    },
    date:{
        type:String,
        default:Date.now
    },
    brand:{
        type:String,
        required:true
    },
    description:{
        type:String
    },
    review:{
        type:Number,
        default:0
    },
    rating:{
        type:Number,
        default:0
    },
    offer:{
        type:Number,
        default:0
    },
    discountPrice:{
        type:Number,
        default:0
    }
},
{timestamps:true}
)
module.exports=mongoose.model("productsCollection",productSchema)