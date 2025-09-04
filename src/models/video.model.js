import mongoose, { Schema } from "mongoose";

const videoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: "No description"
    },
    publishedPublicly:{
        type: Boolean,
        default: true
    },
    duration:{
        type: String
    },
    userID: {
        type: Schema.Types.ObjectId,
        ref: "User",
        index: true
    },
    thumbnail: {
        type: String,
        required: true
    }
},
{timestamps: true})

const Video = mongoose.model("Video", videoSchema);