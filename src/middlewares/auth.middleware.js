import userModel from "../models/user.model.js";
import sessionModel from "../models/session.model.js";
import jwt from "jsonwebtoken";
import config from "../config/config.js";

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization

    // 1. Check for the Authorization header and Bearer scheme
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized, please login first"
        })
    }

    const token = authHeader.split(" ")[1]

    try {
        // 2. Verify the JWT signature and expiry
        const decoded = jwt.verify(token, config.jwt_secret)

        // 3. Ensure the session is still active (not revoked)
        const session = await sessionModel.findOne({
            _id: decoded.sessionId,
            revoked: false
        })

        if (!session) {
            return res.status(401).json({
                success: false,
                message: "Session has been revoked or expired, please login again"
            })
        }

        // 4. Ensure the user still exists
        const user = await userModel.findById(decoded.id).select("-password")

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            })
        }

        // 5. Role-based authorization check
        if (user.role !== "partner") {
            return res.status(403).json({
                success: false,
                message: "Forbidden, only food partners can perform this action"
            })
        }

        req.user = user

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