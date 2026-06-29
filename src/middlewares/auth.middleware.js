import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import config from "../config/config.js";

const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]

    if(!token){
        return res.status(401).json({
            success: false,
            message: "Unauthorized, please login first"
        })
    }

    try {
        const decoded = jwt.verify(token, config.jwt_secret)

        const foodPartner = await userModel.findById(decoded.id)

        if (!foodPartner) {
          return res.status(401).json({
            success: false,
            message: "User not found",
          });
        }

        if (foodPartner.role !== "partner") {
          return res.status(403).json({
            success: false,
            message: "Unauthorized, you are not a food partner",
          });
        }

        req.user = foodPartner

        next()
    } catch (error) {
        console.error("Auth middleware error:", error.message)
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Access token expired, please refresh"
            })
        }
        return res.status(401).json({
            success: false,
            message: "Invalid token"
        })
    }
}

export default authMiddleware