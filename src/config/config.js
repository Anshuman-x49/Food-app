import dotenv from 'dotenv'
dotenv.config()

console.log('Environment variables loaded:', {
    PORT: process.env.PORT ? '✓' : '✗',
    MONGO_URI: process.env.MONGO_URI ? '✓' : '✗',
    JWT_SECRET: process.env.JWT_SECRET ? '✓' : '✗',
});

if (!process.env.PORT || !process.env.MONGO_URI || !process.env.JWT_SECRET) {
    throw new Error('Please provide all the required environment variables')
}

const config = {
    port: process.env.PORT,
    mongo_uri: process.env.MONGO_URI,
    jwt_secret: process.env.JWT_SECRET
}

export default config