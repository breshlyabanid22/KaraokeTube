import io from "socket.io-client";
import SearchBar from "../components/SearchBar";
import { useEffect, useState } from "react";

const socket = io(import.meta.env.VITE_API_URL, {
  transports: ["websocket"],
});

export default function Session({ sessionCode, username }) {

  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if(success){
      const timer = setTimeout(() => {
        setSuccess(false);  
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleAddSong = (video) => {
    socket.emit("addSong", {
      sessionCode,
      videoId: video.videoId,
      title: video.title,
      addedBy: username,
    });
    setSuccess(true);
  };

  return (
    <div>
      {success && ( 
        <span className="sticky block top-2 mt-5 mx-auto w-full bg-green-500 text-center text-white rounded p-2 ">Song has been added!</span>
      )}
      <div className="flex justify-between font-bold mb-4">
        <h2>Select songs</h2>
        <a 
          href="#queue"
          className="bg-blue-900 text-white font-normal rounded w-22 py-2 text-center text-sm"
          >See queue</a>
      </div>
      <SearchBar onSelect={handleAddSong}/>
    </div>
  );
}
