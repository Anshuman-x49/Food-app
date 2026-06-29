import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import foodController from "../controllers/food.controller.js";
import multer from "multer";

const foodRouter = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter(req, file, callback){
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
        if(allowedTypes.includes(file.mimetype)){
            callback(null, true);
        }else{
            callback(new Error("Only JPEG, PNG, JPG and WebP files are allowed"));
        }
    }
});

/**
* @desc add food
* @route POST /api/v1/food/add-food
* @access protected
*/
foodRouter.post("/add-food", authMiddleware, upload.single("media"), foodController.addFood);

export default foodRouter;