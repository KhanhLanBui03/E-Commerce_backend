import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        default: '',
    },
    address: {
        type: String,
        default: '',
    },
    cartData: {
        type: Object,
        default: {},
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
},{minimize: false});

const userModel = mongoose.model("User", userSchema);

export default userModel;