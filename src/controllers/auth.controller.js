import usermodel from "./models/user.model.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { jwt_secret } from "../config/config.js"


/**
 * 
 * @desc register a new user
 * @route POST /api/v1/auth/register
 * @access public
 */
const registerUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body

        if(!username || !email || !password, !role) {
            return res.status(400).json({
                success: false,
                message: "Please provide all the required fields"
            })
        }

        const userExist = await usermodel.findOne({
            $or: [
                {email},
                {username}
            ]
        })

        if(userExist){
            return res.status(400).json({
                success: false,
                message: "User already exists"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await usermodel.create({
            username,
            email,
            password: hashedPassword,
            role
        })

        const refreshToken = await jwt.sign({
            id: user._id
        },jwt_secret,{
            expiresIn: "7d"
        })

        const accessToken = await jwt.sign({
            id: user._id
        }, jwt_secret, {
            expiresIn: "10m"
        })

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        })

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                username,
                email,
                role,
                accessToken
            }
        })
    } catch (error) {
        console.log("Error in user registration:", error)
        return res.status(500).json({
          success: false,
          message: "An error occurred while registering the user. Please try again."
        })
    }
}

/**
 * 
 * @desc login an existing user
 * @route POST /api/v1/auth/login
 * @access public
 */
const loginUser = async (req, res) => {
    try {
        const { username, email, password } = req.body

        if(!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide all the required fields"
            })
        }

        const user = await usermodel.findOne({
            $or: [
                {username},
                {email}
            ]
        })

        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        const ispasswordvalid = await bcrypt.compare(password, user.password)

        if(!ispasswordvalid){
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            })
        }

        const refreshToken = await jwt.sign({
            id: user._id
        }, jwt_secret, {
            expiresIn: "7d"
        })

        const accessToken = await jwt.sign({
            id: user._id
        }, jwt_secret, {
            expiresIn: "10m"
        })

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        })

        return res.status(200).json({
            message: "User logged in successfully",
            user: {
                id: user._id,
                username,
                email,
                role,
                accessToken
            }
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "An error occurred while logging in the user. Please try again."
        })
    }
}

module.export = {
    registerUser,
    loginUser
}