import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Customer } from "../models/Customer.js";

export type CustomerAuthRequest = Request & {
  customer?: { id: string; role: "customer" };
};

export const customerAuth = async (
  req: CustomerAuthRequest,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as {
      id: string;
      role: string;
    };
    if (decoded.role !== "customer") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const customer = await Customer.findById(decoded.id).select("-password");
    if (!customer || !customer.isActive) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.customer = { id: customer.id, role: "customer" };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};
