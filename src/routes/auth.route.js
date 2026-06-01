import express from 'express'
import authController from '../controllers/auth.controller.js'

const authRouter = express.Router()

/**
* @desc register a new user
* @route POST /api/v1/auth/register
* @access public
*/
authRouter.post("/register", authController.registerUser)

/**
* @desc login an existing user
* @route POST /api/v1/auth/login
* @access public
*/
authRouter.post("/login", authController.loginUser)

/**
* @desc logout user
* @route POST /api/v1/auth/logout
* @access public
*/
authRouter.post("/logout", authController.logoutUser)

export default authRouter