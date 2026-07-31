import mongoose from "mongoose";
import { User } from "./src/models/user.models.js";
import { Group } from "./src/models/group.models.js";
import { removeUser } from "./src/controllers/group.controllers.js";
import dotenv from "dotenv";

dotenv.config();

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const group = await Group.findOne({ "teamMembers.1": { $exists: true } });
    if (!group) { console.log("No group"); return process.exit(0); }
    
    const leaderId = group.leader;
    const memberId = group.teamMembers.find(m => m.toString() !== leaderId.toString());
    
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
        await new Promise((resolve, reject) => {
            removeUser(req, res, (err) => {
                if (err) reject(err);
            });
            setTimeout(resolve, 500); // wait for async handler
        });
        console.log("Status:", resStatus, "Data:", JSON.stringify(resJson));
    } catch (e) {
        console.log("Error:", e.statusCode, e.message);
    }
    process.exit(0);
}
run().catch(console.error);
