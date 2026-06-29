import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"

const app = express()

app.use(express.json({limit: "10kb"}))
app.use(express.urlencoded({ extended: true, limit: "10kb"}))
app.use(express.static("public"))
app.use(cookieParser())
app.use(cors())

/**
 * Auth routes
 */
import authRoutes from "./routes/auth.route.js"
app.use("/api/v1/auth", authRoutes)

/**
 * Food routes
 */
import foodRoutes from "./routes/food.route.js"
app.use("/api/v1/food", foodRoutes)

/**
 * Error handler middleware
 */
import multerErrorHandler from "./middlewares/multer-error.middleware.js"
app.use(multerErrorHandler)

export default app
