import jwt from "jsonwebtoken";
import config from "../config/config.js";

const authMiddleware = (req, res, next) => {
    const token = req.cookies.refreshToken || req.headers.authorization?.split(" ")[1]

    if(!token){
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        })
    }

    try {
        const decoded = jwt.verify(token, config.jwt_secret)

        req.user = decoded

        next()
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

export default authMiddleware