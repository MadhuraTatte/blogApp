const jwt=require("jsonwebtoken")
const {Blacklist}=require("../models/blacklist.model")
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const authenticate=async (req,res,next)=>{
    const {AccessToken}=req.cookies
    const TokenBlacklisted=await Blacklist.findOne({token:AccessToken})
    if(TokenBlacklisted){
        return res.status(400).send({"msg":"please login"})
    }


    jwt.verify(AccessToken,"Token_secret",async (err,decoded)=>{
        if(err){
            if(err.message==="jwt expired"){
                const newAccessToken=await fetch("https://puzzled-bandanna-colt.cyclic.app/user/refresh-token",{
                    
                headers:{
                        "Content-Type":"application/json",
                        Authorization:req.cookies.AccessRefreshToken,
                    }
                }).then((res)=>res.json());
                res.cookie("AccessToken",newAccessToken,{maxAge:60*500})
                next();
            }
        }else{
            console.log(decoded);
            next();
        }
    })
}

module.exports={
    authenticate
}

