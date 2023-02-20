const mongoose=require("mongoose");
mongoose.set("strictQuery",false);

module.exports.dbconnection=(cb)=>{
    mongoose.connect(process.env.url,{
        useNewUrlParser:true,
        useUnifiedTopology:true
    }).then(()=>{
        cb(true)
    }).catch((err)=>{
        console.log(err);
        cb(false)
    })
}
