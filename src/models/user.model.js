import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String
    },
    role: {
        type: String,
        enum: ['user', 'partner'],
        default: 'user'
    }
},
    { timestamps: true }
);

const User = mongoose.model('User', userSchema)

export default User