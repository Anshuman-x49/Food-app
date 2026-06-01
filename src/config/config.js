import dotenv from 'dotenv'
dotenv.config()

console.log('Environment variables loaded:', {
    PORT: process.env.PORT ? '✓' : '✗',
    MONGO_URI: process.env.MONGO_URI ? '✓' : '✗',
    JWT_SECRET: process.env.JWT_SECRET ? '✓' : '✗',
});

if (!process.env.PORT || !process.env.MONGO_URI || !process.env.JWT_SECRET) {
    console.log('Please provide all the required environment variables')
}

const port = process.env.PORT
const mongo_uri = process.env.MONGO_URI
const jwt_secret = process.env.JWT_SECRET

export {
    port,
    mongo_uri,
    jwt_secret
}