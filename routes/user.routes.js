const express=require("express")
const userRouter=express.Router()
const {UserModel}=require("../models/user.model")
const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken")
const {authenticate}=require("../middlewares/authenticate")
const {Blacklist}=require("../models/blacklist.model")

userRouter.post("/create",async(req,res)=>{
    try{
       const {name,email,password,role}=req.body;

       const userPresent=await UserModel.findOne({email})
       if(userPresent){
        return res.status(400).send({"msg":"User already exists,please login."})
       }

       const hash_password=bcrypt.hashSync(password,6)
       const user=new UserModel({name,email,password:hash_password,role})
       await user.save();

       res.status(200).send({"msg":"New user created successfully."})
    }catch(err){
        res.send({"msg":err.message})
    }
})

userRouter.post("/login",authenticate,async(req,res)=>{
    try{
       const {email,password}=req.body;

       const userPresent=await UserModel.findOne({email})
       if(!userPresent){
        return res.status(400).send({"msg":"User not exists,please signup."})
       }

       const passwordMatch=bcrypt.compareSync(password,userPresent.password);
       if(!passwordMatch){
        return res.status(400).send({"msg":"Wrong Credential."})
       }

       const Token=jwt.sign({email,role:userPresent.role},"Token_secret",{expiresIn:"1m"});
       const RefreshToken=jwt.sign({email,role:userPresent.role},"RefreshToken_secret",{expiresIn:"3m"});

       res.cookie("AccessToken",Token,{maxAge:60*500});
       res.cookie("AccessRefreshToken",RefreshToken,{maxAge:60*500*5})

       res.status(200).send({"msg":"Login successFul"})

       
    }catch(err){
        res.send({"msg":err.message})
    }
})

userRouter.get("/logout",async(req,res)=>{
    try{
      const {AccessToken,AccessRefreshToken}=req.cookies;
      const blacklistAccessToken=new Blacklist({AccessToken:AccessToken})
      const blacklistAccessRefreshToken=new Blacklist({AccessRefreshToken:AccessRefreshToken})

      await blacklistAccessToken.save()
      await blacklistAccessRefreshToken.save()

      res.send({"msg":"Logout successful."})

    }catch(err){
        res.send({"msg":err.message})
    }
})

userRouter.get("/refresh-token",async(req,res)=>{
    try{
        const AccessRefreshToken=req.cookies.AccessRefreshToken||req?.headers?.authorization;
        const TokenBlacklisted=await Blacklist.find({token:AccessRefreshToken})
        if(TokenBlacklisted){
            return res.status(400).send({"msg":"Please login"})
        }

        const TokenValid=jwt.verify(AccessRefreshToken,"RefreshToken_secret");
        if(!TokenValid){
            return res.status(400).send({"msg":"Please login again"});
        }

        const newAccessToken=jwt.sign({email:TokenValid.email,role:TokenValid.role},"Token_secret",{expiresIn:"1m"})

        res.cookie("AccessToken",newAccessToken,{maxAge:60*500});
        res.send({"msg":"Token generated."})
    }catch(err){
        res.send({"msg":err.message})
    }
})


module.exports={
    userRouter
}