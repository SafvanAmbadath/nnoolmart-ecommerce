const express=require("express")
const app=express()
const path=require("path")
const logger = require("morgan");
const session=require("express-session")
const db=require("./config/connection")
var flash = require('connect-flash');

const userRouter=require("./routes/userRouter")
const adminRouter=require("./routes/adminRouter")
const router = require("./routes/userRouter")

app.set("views",path.join(__dirname,"views"))
app.set("view engine","ejs")

// app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use(express.static(path.join(__dirname,"public")))
app.use(flash());

//session
app.use(
    session({
      secret: "testkey",
      resave:false,   
      saveUninitialized: true,
      cookie: { maxAge: 6000000000000}
    })
  );



app.use("/",userRouter)
app.use("/",adminRouter)

db.dbconnection((err)=>{
    if(err){
        console.log("connected to db");
    }else{
        console.log("error in db connection");
    }
})
app.use((req,res,next)=>{
  console.log("html")
  res.status(404)
  if(req.accepts('html')){
    res.render("admin/error")
  }
})

app.listen(3000)
 