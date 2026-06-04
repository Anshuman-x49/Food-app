import app from "./src/app.js"
import config from "./src/config/config.js"
import connectDB from "./src/config/db.js"

connectDB()

app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port} `)
})