import jwt from "jsonwebtoken";
import { Customer } from "../models/Customer.js";
export const optionalCustomerAuth = async (req, res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer "))
        return next();
    try {
        const token = header.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
        if (decoded.role !== "customer")
            return next();
        const customer = await Customer.findById(decoded.id).select("-password");
        if (customer?.isActive) {
            req.customer = { id: customer.id, role: "customer" };
        }
        next();
    }
    catch {
        next();
    }
};
