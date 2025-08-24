import { useState, useEffect } from "react";
import io from "socket.io-client";
import Session from "./pages/Session.jsx";
import { Queue } from "./components/Queue.jsx";
import VideoPlayer from "./components/VideoPlayer.jsx"
import { SongProvider } from "./components/SongProvider.jsx";

const socket = io(import.meta.env.VITE_API_URL,{
  transports: ["websocket"],
});

export default function App() {
  const [username, setUsername] = useState("");
  const [sessionCode, setSessionCode] = useState("SESSION_");
  const [joined, setJoined] = useState(false);
  const [users, setUsers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  // Join session
  const handleJoin = () => {
    if (!username || !sessionCode) return;
    socket.emit("joinSession", { sessionCode, username });
    setJoined(true);
  };

  // Listen to socket events
  useEffect(() => {
    socket.on("userJoined", (users) => {
      setUsers(users);
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
    <div className="flex justify-center h-screen">
      {!joined ?  (
        <div className="flex flex-col gap-3 w-full h-full align-center justify-center px-100 md:w-full bg-slate-700">
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
            className="bg-blue-500 text-white p-2 rounded"
            onClick={handleJoin}
          >
            Create/Join
          </button>
          <p className="text-center text-sm text-slate-400">@2025 karaokeTube</p>
        </div>  
      ) : (
        <>
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
              <p className="text-gray-600">You are logged in as {username}</p>

              {/* Users */}
              <div>
                <h3 className="text-lg font-semibold">Users in lobby:</h3>
                <ul className="flex flex-wrap gap-1">
                  {users.map((u, idx) => (
                    <li 
                      className="text-white bg-gray-500 px-1 rounded inline"
                      key={idx}
                      >{u.username}
                    </li>
                  ))}
                </ul>
              </div>
              <Session sessionCode={sessionCode} username={username}/>
              <Queue socket={socket} sessionCode={sessionCode}/>
             </div>          
            </>
          )}
        </>
      )}
    </div>
  </SongProvider>
  );
}
