const userCollection=require("../model/userModel")
module.exports={
    userSession:(req,res,next)=>{
        if(req.session.loggedIn){
            next()
        }else{
            console.log("to login")
            res.redirect("/login")
        }
    },
    checkBlock:async(req,res,next)=>{
        let user=await userCollection.findOne({_id:req.session.user._id})
        // console.log(user)
        if(user.block===false){
            next()
        }else{
            res.render("user/userblocked")
            // res.send("user blocked")
            req.session.destroy()
        }
    },
    noSession:(req,res,next)=>{
        if(req.session.loggedIn){
            res.redirect("/")
        }else{
            console.log("logged out")
            next()
        }
    }   
}