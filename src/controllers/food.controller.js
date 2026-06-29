import foodModel from "../models/food.model.js"
import { v4 as uuidv4 } from "uuid"
import { uploadFile } from "../services/storage.service.js"

/**
 * @desc add food
 * @route POST /api/v1/food/add-food
 * @access protected
 */
const addFood = async (req, res) => {
    try {
        const foodData = req.body

        const foodFile = req.file

        if(!foodData.name || !foodData.price || !foodData.description || !foodFile || !foodData.category){
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        const fileResult = await uploadFile(foodFile, uuidv4())

        const foodItem = await foodModel.create({
            name: foodData.name,
            description: foodData.description,
            media: fileResult.url,
            category: foodData.category,
            price: foodData.price,
            partner: req.user.id
        })

        return res.status(201).json({
            success: true,
            message: "Food added successfully",
            data: foodItem
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

export default {
    addFood
}