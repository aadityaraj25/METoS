import mongoose from "mongoose";
import { User } from "./src/models/user.models.js";
import { Group } from "./src/models/group.models.js";
import dotenv from "dotenv";

dotenv.config();

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected");
    
    // find a group
    const group = await Group.findOne();
    if (!group) return console.log("No group");
    console.log("Group:", group.teamName);
    
    // find users
    const users = await User.find().limit(2);
    console.log("Users:", users.map(u => u.username));
    
    process.exit(0);
}
run().catch(console.error);
