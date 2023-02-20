module.exports={
    adminSession:(req,res,next)=>{
        if(req.session.adminLoggedIn){
       next();
    
        }else{
            res.redirect("/adminlogin");
        }
    }
}

