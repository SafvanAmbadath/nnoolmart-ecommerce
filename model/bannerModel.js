const { array } = require("../middlewares/multer")

const mongoose=require("mongoose")
const bannerSchema=new mongoose.Schema({

     head1:{
        type:String,
        required:true
     },
     head2:{
        type:String,
        
     },
     head3:{
        type:String,
       
     },
     description:{
        type:String,
        
     },
     imageUrl:{
        type:Array,
        required:true
     },
     route:{
        type:String,
        required:true
     },
     delete:{
        type:Boolean,
        default:false
     },
     offer:{
        type:Number,
        default:0
     }
},
{
    timestamps:true
})
module.exports=mongoose.model("bannerCollection",bannerSchema)

