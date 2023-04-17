const mongoose=require("mongoose")

const blogSchema=mongoose.Schema({
    title:{type:String,required:true},
    body:{type:String,required:true},
    author:{type:String,required:true},
    no_of_comments:{type:Number,required:true}
    
},{
    versionKey:false
})


const BlogModel=mongoose.model("blog",blogSchema);

module.exports={
    BlogModel
}