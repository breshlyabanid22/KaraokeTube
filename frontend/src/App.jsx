import { useState, useEffect } from "react";
import io from "socket.io-client";
import Session from "./pages/Session.jsx";
import { Queue } from "./components/Queue.jsx";
import VideoPlayer from "./components/VideoPlayer.jsx"
import { SongProvider } from "./components/SongProvider.jsx";
import { GridLoader } from "react-spinners";

const socket = io(import.meta.env.VITE_API_URL,{
  transports: ["websocket"],
});

export default function App() {
  const [username, setUsername] = useState("");
  const [sessionCode, setSessionCode] = useState("SESSION_");
  const [joined, setJoined] = useState(false);
  const [users, setUsers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [loading, setLoading] = useState(false);

  // Join session
  const handleJoin = () => {
    if (!username || !sessionCode) return;
    socket.emit("joinSession", { sessionCode, username });
    setLoading(true)
    setJoined(true);
  };

  // Listen to socket events
  useEffect(() => {
    socket.on("userJoined", (users) => {
      setUsers(users);
      setLoading(false);
    });
    socket.on("hostAssigned", ({host}) => {
      if(socket.id === host){
        setIsHost(true);
      }
    })

    return () => {
      socket.off("userJoined");
      socket.off("hostAssigned");
    };
  }, []);

  return (
    <SongProvider>
    <div className="flex justify-center bg-primary">
      {loading ? (
        <div className="flex flex-col gap-10 justify-center items-center h-screen">
          <GridLoader color="#FF6900" size={50}/>
          <p className="text-secondary md:text-lg">Connecting to server. Please wait...</p>
        </div>
      ): !joined ?  (
        <div className="flex flex-col gap-3 w-full h-screen align-center justify-center px-4 md:px-100 lg:px-100 md:w-full bg-primary">
          <h2 className="text-xl font-bold text-center text-white">Host/Join a Session</h2>
          <input
            type="text"
            placeholder="Enter your name"
            className="border p-2 rounded focus:outline-none border-none bg-slate-100"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter session code"
            className="border p-2 rounded focus:outline-none border-none bg-slate-100"
            value={sessionCode}
            onChange={(e) => setSessionCode(e.target.value)}
            />
          <button
            className="bg-secondary hover:bg-orange-400 text-white p-2 rounded"
            onClick={handleJoin}
          >
            Create/Join
          </button>
          <p className="text-center text-sm text-slate-400">@2025 karaokeTube by @breshlyabanid@gmail.com</p>
        </div>  
      ) : (
        <div className="w-screen text-white md:mx-100">
          {/* Search & Add songs */}  
          {isHost ? (
            <>
              <VideoPlayer socket={socket} sessionCode={sessionCode}/>
              <Queue socket={socket} sessionCode={sessionCode} hideUI={true}/>
            </>
            ) : (
            <>
            <div className="w-full h-full p-4 m-auto">
              <h2 className="text-2xl font-bold">
                Lobby: {sessionCode}
              </h2>
              <p className="text-secondary text-sm">You are logged in as {username}</p>
              <div>
                <h3 className="text-md">People in lobby:</h3>
                <ul className="flex flex-wrap gap-2">
                  {users.map((u, idx) => (
                    <li 
                      className="text-white mt-2 bg-indigo-700 px-2 rounded inline"
                      key={idx}
                      >{u.username}
                    </li>
                  ))}
                </ul>
                <Session sessionCode={sessionCode} username={username}/>
                <Queue socket={socket} sessionCode={sessionCode}/>
              </div>
             </div>          
            </>
          )}
        </div>
      )}
    </div>
  </SongProvider>
  );
}
