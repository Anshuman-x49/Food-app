import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import foodController from "../controllers/food.controller.js";

const foodRouter = express.Router();

/**
* @desc add food
* @route POST /api/v1/food/add-food
* @access protected
*/
foodRouter.post("/add-food", authMiddleware, foodController.addFood);

export default foodRouter;