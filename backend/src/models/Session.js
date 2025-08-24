import mongoose from "mongoose";


const sessionSchema = new mongoose.Schema({
    sessionCode: {
        type: String,
        required: true,
        unique: true
    },
    queue: [
        {
            videoId: String,
            title: String,
            addedBy: String
        }
    ],
    users: [
        {
            username: String,
            socketId: String
        }
    ],
    host: {type: String, default: null},
    createdAt: { type: Date, default: Date.now},
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 1000 * 60 * 20),
    },
});

sessionSchema.index({ expiresAt: 1}, { expireAfterSeconds: 0});

const Session = mongoose.model("Session", sessionSchema);
export default Session;