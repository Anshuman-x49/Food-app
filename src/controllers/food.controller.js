import foodModel from "../models/food.model.js"

const addFood = async (req, res) => {
    try {
        const foodData = req.body

        if(!foodData.name || !foodData.price || !foodData.description){
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        const food = await foodModel.create({
            name: foodData.name,
            description: foodData.description,
            price: foodData.price
        })

        return res.status(201).json({
            success: true,
            message: "Food added successfully",
            data: food
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