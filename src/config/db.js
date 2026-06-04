import mongoose from "mongoose"
import config from "./config.js"

const connectDB = async () => {
    try {
        await mongoose.connect(`${config.mongo_uri}`)
        console.log("MongoDB connected successfully")
    } catch (error) {
        console.error(`Error while connecting to database: ${error}`)
        process.exit(1)
    }
}

export default connectDB