import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    proficiency: {
      type: Number,
      required: true,
      min: 1,
      max: 5, // 1-5 dots like in your UI
    },
  },
  { _id:false }
);


const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
      trim:true,
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type:String, 
      required: [ true, "password is required" ],
    },

    profileImage:{
      type:String,  // handeled later by cloudinary or OAuth profile image response
    },
    headline:{
      type:String,
    },
    bio:{
      type:String,
    },
    location:{
      type:String,
    },

    experience:{
      type:Number,
      default:0,
    },

    // social links ---> not active yet
    socialLinks: {
      github: {
        type: String,
        default: "",
      },
      linkedin: {
        type: String,
        default: "",
      },
      portfolio: {
        type: String,
        default: "",
      },
      twitter: {
        type: String,
        default: "",
      },
    },

    skills: [skillSchema],

    projects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
    ],

    groups: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
      },
    ],

    connections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

//bcrypt 
// bcrypt.hash(password, saltRounds) //it is no. of rounds the hashing will be done, async (err, hash) => {}

// saving the password in hashed form before saving it to the DB
// mongoDB hooks
userSchema.pre("save", async function (){
    if(!this.isModified("password")) return
    this.password = await bcrypt.hash(this.password,10)
})

// user defined methods -- isPasswordCorrect is added
userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function(){
    // returns the access token
    return jwt.sign(
        // payload
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullName:this.fullName,
        },

        // access token
        process.env.ACCESS_TOKEN_SECRET,
        
        // token expiry time
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    // returns the refresh token
    return jwt.sign(
        // payload
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullName:this.fullName,
        },

        // access token
        process.env.REFRESH_TOKEN_SECRET,
        
        // token expiry time
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    )
}

export default User = mongoose.model("User", userSchema);



