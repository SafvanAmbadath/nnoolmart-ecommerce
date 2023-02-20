const mongoose=require("mongoose");
mongoose.set("strictQuery",false);

module.exports.dbconnection=(cb)=>{
    mongoose.connect("mongodb://0.0.0.0:27017/nnoolmart",{
        useNewUrlParser:true,
        useUnifiedTopology:true
    }).then(()=>{
        cb(true)
    }).catch((err)=>{
        console.log(err);
        cb(false)
    })
}
