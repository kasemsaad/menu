import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
export const auth = async (req, res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    try {
        const token = header.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
        const user = await User.findById(decoded.id).select("-password");
        if (!user || !user.isActive) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        req.user = { id: user.id, role: user.role, branchId: user.branchId?.toString() };
        next();
    }
    catch {
        return res.status(401).json({ message: "Invalid token" });
    }
};
export const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Forbidden" });
        }
        next();
    };
};
