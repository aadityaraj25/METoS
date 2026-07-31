import mongoose from "mongoose";
import { User } from "./src/models/user.models.js";
import { Group } from "./src/models/group.models.js";
import { removeUser } from "./src/controllers/group.controllers.js";
import dotenv from "dotenv";

dotenv.config();

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected");
    
    // find a group with more than 1 member
    const group = await Group.findOne({ "teamMembers.1": { $exists: true } });
    if (!group) return console.log("No group with >1 member");
    
    const leaderId = group.leader;
    const memberId = group.teamMembers.find(m => m.toString() !== leaderId.toString());
    
    console.log("Found group:", group._id);
    console.log("Leader:", leaderId);
    console.log("Member to remove:", memberId);
    
    const req = {
        params: { groupId: group._id.toString(), userId: memberId.toString() },
        user: { _id: leaderId }
    };
    
    let resJson, resStatus;
    const res = {
        status: (code) => { resStatus = code; return res; },
        json: (data) => { resJson = data; }
    };
    
    try {
        await removeUser(req, res, () => {});
        console.log("Status:", resStatus, "Data:", resJson);
    } catch (e) {
        console.log("Error:", e.statusCode, e.message);
    }
    
    process.exit(0);
}
run().catch(console.error);
