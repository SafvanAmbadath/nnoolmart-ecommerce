const mongoose=require("mongoose")

const categorySchema=new mongoose.Schema({
    categoryName:{
        type:String,
        required:true
    },
    imageUrl:{
        type:Array,
        required:true
    },
    description:{
        type:String,
        required:true,
        max:100
    },
    offer:{
        type:Number,
        default:0
    }
},
{timestamps:true}
)
module.exports=mongoose.model('categoryCollection',categorySchema)