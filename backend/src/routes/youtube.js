import express from "express"
import axios from "axios"
import dotenv from "dotenv"

dotenv.config();

const router = express.Router();

router.get("/search", async (req, res) => {
    const {q, channelId} = req.query;

    if(!q) return res.status(400).json({error: "Query is required"});

    try {
        const params = {
                part: "snippet",
                type: "video",
                maxResults: 20,
                q,
                key: process.env.YOUTUBE_API_KEY,
        };

        if(channelId){
            params.channelId = channelId;
        }

        const response = await axios.get("https://www.googleapis.com/youtube/v3/search", { params });

        const results = response.data.items.map(item => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.default.url,
        channel: item.snippet.channelTitle,
        }));

        res.json(results);
    } catch (error) {
        console.error("YouTube API error", error.message);
        res.status(500).json({ error: "Failed to fetch YouTube results" });
    }
})

export default router;