import { User } from "../models/user.models.js";
import redis from "../config/redis.js";

export const syncUsernamesToRedis = async () => {
    try {
        console.log("Syncing usernames to Redis...");
        const users = await User.find({}, "username").lean();
        if (users.length === 0) {
            console.log("No users to sync.");
            return;
        }
        const usernames = users.map(user => user.username.toLowerCase());
        await redis.sadd("taken_usernames", ...usernames);
        console.log(`Successfully synced ${usernames.length} usernames to Redis.`);
    } catch (error) {
        console.error("Error syncing usernames to Redis:", error);
    }
};
