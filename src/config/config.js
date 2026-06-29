import dotenv from 'dotenv'
dotenv.config()

console.log('Environment variables loaded:', {
    PORT: process.env.PORT ? '✓' : '✗',
    MONGO_URI: process.env.MONGO_URI ? '✓' : '✗',
    JWT_SECRET: process.env.JWT_SECRET ? '✓' : '✗',
    IMAGEKIT_PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY ? '✓' : '✗',
    IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY ? '✓' : '✗',
    IMAGEKIT_URL_ENDPOINT: process.env.IMAGEKIT_URL_ENDPOINT ? '✓' : '✗',
});

if (!process.env.PORT || !process.env.MONGO_URI || !process.env.JWT_SECRET || !process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_URL_ENDPOINT) {
    throw new Error('Please provide all the required environment variables')
}

const config = {
    port: process.env.PORT,
    mongo_uri: process.env.MONGO_URI,
    jwt_secret: process.env.JWT_SECRET,
    imagekit_public_key: process.env.IMAGEKIT_PUBLIC_KEY,
    imagekit_private_key: process.env.IMAGEKIT_PRIVATE_KEY,
    imagekit_url_endpoint: process.env.IMAGEKIT_URL_ENDPOINT
}

export default config