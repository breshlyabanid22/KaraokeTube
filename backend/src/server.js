import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import dotenv from 'dotenv'
import http from "http"
import {Server} from 'socket.io'
import sessionRoutes from "./routes/sessionRoutes.js";
import Session from "./models/Session.js"
import youtubeRoutes from "./routes/youtube.js"

dotenv.config();

const FRONTEND_URL = process.env.FRONTEND_URL || "https://karaoketube.vercel.app"
const SESSION_TIMEOUT = process.env.SESSION_TIMEOUT || 300000
const app = express()
//middleware
app.use(cors({
//   origin: "*",
  origin: [FRONTEND_URL],
  methods: ["GET", "POST"],
  credentials: true
}));
app.use(express.json())

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        // origin: "*",
        origin: FRONTEND_URL,
        methods: ["GET", "POST"],
        credentials: true
    }
});
app.set("trust proxy", 1);
//Routes
app.use("/api/session", sessionRoutes);
app.use("/api/youtube", youtubeRoutes);

app.get("/health", (_req, res) => {
    res.json({status: "Backend is running!"});
})

//mongodb connection

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
.then(() => console.log("Connected to mongodb"))
.catch(err => console.error("Mongodb connection error: ", err));

//websocket
io.on("connection", (socket) => {
    console.log("User connected: ", socket.id);

    const sessionCleanupTimers = new Map();

    function scheduledSessionCleanup(sessionCode){
        if(sessionCleanupTimers.has(sessionCode)) return;

        const timer = setTimeout(async () => {
            await Session.deleteOne({sessionCode});
            sessionCleanupTimers.delete(sessionCode);
        }, SESSION_TIMEOUT);

        sessionCleanupTimers.set(sessionCode, timer);
    }

    function cancelSessionCleanup(sessionCode){
        if(sessionCleanupTimers.has(sessionCode)){
            clearTimeout(sessionCleanupTimers.get(sessionCode));
            sessionCleanupTimers.delete(sessionCode);
        }
    }

    socket.on("disconnect", async () => {
      console.log("User disconnected:", socket.id);
    
      const { sessionCode, username } = socket.data;
      if(!sessionCode || !username) return;
    
      const session = await Session.findOne({sessionCode});
      if(session){
          session.users = session.users.filter((u) => u.socketId !== socket.id);

          if(session.host === socket.id){
            session.host = session.users.length > 0 ? session.users[0].socketId : null
          }
    
          if(session.users.length === 0){
              await Session.deleteOne({ sessionCode });
              scheduledSessionCleanup(sessionCode);
          }
    
            await session.save();
            io.to(sessionCode).emit("userLeft", { socketId: socket.id });
            io.to(sessionCode).emit("hostAssigned", { host: session.host });
            console.log(`${username} left session ${sessionCode}`);
      }
    });

    //Join session room
    socket.on("joinSession", async ({ sessionCode, username }) => {

        cancelSessionCleanup(sessionCode);
        socket.join(sessionCode)

        let session = await Session.findOne({sessionCode});
        if(!session){
            session = await Session.create({
                sessionCode,
                users: [],
                queue: [],
                expiresAt: new Date(Date.now() + 1000 * 60 * 30)
            });
        }
        if (!session.users.some(u => u.socketId === socket.id)) {
            session.users.push({ username, socketId: socket.id });
        }   
        if(!session.host){
            session.host = socket.id;
            await session.save();
        }
        session.expiresAt = new Date(Date.now() + 1000 * 60 * 30);
        await session.save();

        io.to(sessionCode).emit("userJoined", session.users);
        io.to(sessionCode).emit("queueUpdated", session.queue); 
        io.to(sessionCode).emit("hostAssigned", {host: session.host}); 
    
        console.log(`${username} joined session ${sessionCode}`);

  });
  
  socket.on("playVideo", ({ sessionCode, videoId }) => {
    io.to(sessionCode).emit("videoPlaying", {videoId: videoId});
    console.log("video is played", videoId);
  })

  socket.on("addSong", async ({ sessionCode, videoId, title, addedBy }) => {
    try {
        const session = await Session.findOne({sessionCode});
        if (!session) return;

        const newSong = { videoId, title, addedBy };
        session.queue.push(newSong);
        session.expiresAt = new Date(Date.now() + 1000 * 60 * 30);

        if(session.queue.length >= 40){
            return socket.emit("error", { msg: "Queue is full"});
        }
        await session.save();


        //Broadcast updated queue to everyone in session
        io.to(sessionCode).emit("queueUpdated", session.queue);
        
        console.log(`Song added to ${sessionCode} : ${newSong.addedBy}`);
    } catch (error) {
        console.error("Error adding a song", error);
    }
  })

  //Play next song when current finishes
  socket.on("nextSong", async ({sessionCode}) => {
    try {
        const session = await Session.findOne({sessionCode});
        if (!session || session.queue.length === 0) return;
        
        //Remove first song
        const playedSong = session.queue.shift();
        const nextSong = session.queue[0] || null
        await session.save();

        //Notify clients
        io.to(sessionCode).emit("songPlayed", playedSong);
        io.to(sessionCode).emit("queueUpdated", session.queue);
        if(nextSong){
            io.to(sessionCode).emit("videoPlaying", { videoId: nextSong.videoId });
        }
        console.log(`Session finished in ${sessionCode} : ${playedSong.title}`)
    } catch (error) {
        console.error("Error adding a song", error);
    }
  })



});

//start server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {console.log(`Server is running on port:${PORT}`)})


