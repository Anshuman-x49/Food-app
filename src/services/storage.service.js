import ImageKit from "@imagekit/nodejs";
import config from "../config/config.js";

const imageKit = new ImageKit({
    publicKey: config.imagekit_public_key,
    privateKey: config.imagekit_private_key,
    urlEndpoint: config.imagekit_url_endpoint
})

/**
 * @desc upload file to imagekit
 * @param {Object} file
 * @returns {Promise<Object>}
 */
export const uploadFile = async (file, fileName) => {
    try {
        const result = await imageKit.upload({
            file: file.buffer,
            fileName: fileName || file.originalname,
            folder: "food-app"
        })
        return result
    } catch (error) {
        console.error(error)
        throw error
    }
}