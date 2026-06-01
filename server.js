import app from "./src/app.js"
import { port } from "./src/config/config.js"
import connectDB from "./src/config/db.js"

connectDB()

app.listen(port, () => {
    console.log(`Server is running on port ${port} `)
})