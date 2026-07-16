/*
team name
problem id 
problem statement number
reference user
college name
*/

import mongoose from 'mongoose'

const groupSchema = new mongoose.Schema({
    teamName:{
        type:String,
        required:[true, "team name is required"]
    },
    problemId:{
        type:String,
        required:[true, "Problem ID is required"],
    },
    problemStatement:{
        type: String,
        required:[true, "Problem Statement is required"],
    },
    category:{
        type:String,
        required:[true, "Category is required"],
    },
    skills:{     //to be discussed string or ref
        type:String,
        required:true,
    },
    teamSize:{
        type:Number,
        required:[true, "Team Size is required"],
        default:1,
        min:1,
    },
    visibility:{
        type:Boolean,
        required:true,
    },
    leader:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:[true,"leader is required"],
    },
    teamMembers:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
        },
    ],
    status: {
      type: String,
      enum: ["OPEN", "CLOSED"],
      default: "OPEN",
    },
},{
    timestamps:true,
})

groupSchema.methods.generateToken = function(userId){
    // returns the access token
    return jwt.sign(
        // payload
        {
            _id:this._id,
            userId: userId,
        },
        
        // access token
        process.env.INVITE_TOKEN_SECRET,
        
        // token expiry time
        {
            expiresIn: process.env.INVITE_TOKEN_EXPIRY,
        }
    )
}

export const Group = mongoose.model("Group", groupSchema)