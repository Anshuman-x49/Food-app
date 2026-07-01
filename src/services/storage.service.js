import ImageKit, { toFile } from "@imagekit/nodejs";
import config from "../config/config.js";

const imageKit = new ImageKit({
    publicKey: config.imagekit_public_key,
    privateKey: config.imagekit_private_key,
    urlEndpoint: config.imagekit_url_endpoint
})

/**
 * @desc upload file to imagekit
 * @param {Object} file - multer file object (from memory storage)
 * @param {string} fileName - optional custom file name
 * @returns {Promise<Object>}
 */
export const uploadFile = async (file, fileName) => {
    try {
        const fileContent = await toFile(file.buffer, fileName || file.originalname);
        const result = await imageKit.files.upload({
            file: fileContent,
            fileName: fileName || file.originalname,
            folder: "food-app"
        })
        return result
    } catch (error) {
        console.error(error)
        throw error
    }
}