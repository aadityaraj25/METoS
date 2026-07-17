import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

const getUserIdFromToken = (decoded) => {
    if (!decoded || typeof decoded !== "object") return null;
    return decoded.id || decoded._id || decoded.userId || null;
};

const verifyJWT = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization?.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        } else if (req.cookies?.accessToken) {
            token = req.cookies.accessToken;
        }

        if (!token) {
            return res.status(401).json({ success: false, message: "Not authorized — no token provided" });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const userId = getUserIdFromToken(decoded);

        if (!userId) {
            return res.status(401).json({ success: false, message: "Invalid token payload" });
        }

        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(401).json({ success: false, message: "User not found" });
        }

        req.user = user;
        next();
    } catch {
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};

const protect = verifyJWT;

export { verifyJWT, protect, getUserIdFromToken };
