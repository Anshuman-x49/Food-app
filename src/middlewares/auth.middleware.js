import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";

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

        if (foodPartner.role !== "partner") {
          return res.status(403).json({
            success: false,
            message: "Unauthorized, you are not a food partner",
          });
        }

        req.foodPartner = foodPartner

        next()
    } catch (error) {
        console.error(error)
        return res.status(401).json({
            success: false,
            message: "Invalid token"
        })
    }
}

export default authMiddleware