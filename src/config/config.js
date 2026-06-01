import dotenv from 'dotenv'
dotenv.config()

console.log('Environment variables loaded:', {
    PORT: process.env.PORT ? '✓' : '✗',
    MONGO_URI: process.env.MONGO_URI ? '✓' : '✗'
});

if (!process.env.PORT || !process.env.MONGO_URI) {
    console.log('Please provide all the required environment variables');
}

const port = process.env.PORT;
const mongo_uri = process.env.MONGO_URI;

export {
    port,
    mongo_uri
}