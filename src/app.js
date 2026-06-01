import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"

const app = express()

app.use(express.json({limit: "10kb"}))
app.use(express.urlencoded({ extended: true, limit: "10kb"}))
app.use(express.static("public"))
app.use(cookieParser())
app.use(cors())

import authRoutes from "./routes/auth.route.js"

app.use("/api/v1/auth", authRoutes)

export default app
