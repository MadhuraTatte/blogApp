const express=require("express")
const blogRouter=express.Router()
const {BlogModel}=require("../models/blog.model")

blogRouter.post("/create",async (req,res)=>{
    try{
         const payload=req.body;
         const blog=new BlogModel(payload)
         await blog.save();
         res.status(200).send({"msg":"New blog is created."})
    }catch(err){
        res.send({"msg":err.message})
    }
})

blogRouter.get("/",async (req,res)=>{
    try{
       const blogs=await BlogModel.find()
       res.status(200).send(blogs)
    }catch(err){
        res.send({"msg":err.message})
    }
})

blogRouter.patch("/update/:id",async (req,res)=>{
    try{
        const {id}=req.params;
        const payload=req.body;
        await BlogModel.findByIdAndUpdate({_id:id},payload)
        res.status(200).send({"msg":"blog is updated"})

    }catch(err){
        res.send({"msg":err.message})
    }
})

blogRouter.delete("/delete/:id",async (req,res)=>{
    const {id}=req.params;
    try{
       await BlogModel.findByIdAndDelete({_id:id})
       res.status(200).send({"msg":"blog is deleted"})
    }catch(err){
        res.send({"msg":err.message})
    }
})




module.exports={
    blogRouter
}