const express=require("express")
const {connection}=require("./config/db")
require("dotenv").config()
const {userRouter}=require("./routes/user.routes")
const {blogRouter}=require("./routes/blog.routes")
const cookieParser=require("cookie-parser")
const {authenticate}=require("./middlewares/authenticate")

const app=express()
app.use(express.json())
app.use(cookieParser())

app.use("/user",userRouter)
app.use(authenticate)
app.use("/blog",blogRouter)
app.get("/",(req,res)=>{
    res.send("HOME PAGE")
})

app.listen(process.env.port,async()=>{
    try{
       await connection;
       console.log("Connected to db")
       console.log("server is running.")
    }catch(err){
        console.log("Unable to connect to db")
        console.log(err.message)
    }
    
})