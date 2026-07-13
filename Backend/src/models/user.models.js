import mongoose from 'mongoose'

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

export default User = mongoose.model("User", userSchema);



