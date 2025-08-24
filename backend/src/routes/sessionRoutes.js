import express from "express";
import Session from "../models/Session.js";

const router = express.Router();

//Create new session
router.post("/create", async (req, res) => {
    try {
        const { sessionCode } = req.body;

        //Prevent duplicate session codes
        const existing = await Session.findOne({sessionCode});

        if(existing) return res.status(400).json({error: "Session code already exists"});

        const session = new Session({sessionCode, queue: [], user: []});
        await session.save();

        res.json({message: "Session created", session});
    } catch (error) {
        res.status(500).json({error: err.message})
    }
});
//Join Session
router.post("/join", async (req, res) => {
    try {
        const { sessionCode, username} = req.body;
        const session = await Session.findOne({sessionCode});

        if(!session) return res.status(404).json({error: "Session not found. Invalid session code"});

        res.json({message: "Joined session", session});
    } catch (error) {
        res.status(500).json({error: err.message});
    }
});

router.get("/:sessionCode/queue", async (req, res) => {
    try {
        const { sessionCode } = req.params;
        const session = await Session.findOne({ sessionCode });
        if(!sessionCode) return res.status(404).json({error: "Session not found"});

        res.json(session.queue);
    } catch (error) {
        res.status(500).json({error: err.message});
    }
});

export default router;