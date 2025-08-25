import YouTube from "react-youtube";
import { useSong } from "./SongProvider";

export default function VideoPlayer({ socket, sessionCode}) {

  const { currentSong } = useSong();

  const opts = {
    height: "100%",
    width: "100%",
    playerVars: { autoplay: 1 },
  };

  const handleEnd = () => {
    if(currentSong){
      socket.emit("nextSong", {sessionCode, videoId: currentSong.videoId});
    }
  }

  return (
    <div className="w-screen h-screen bg-gray-900 ">
        <div className="flex w-full h-full items-center justify-center">
          <span className="absolute block bg-orange-500 text-white top-10 right-5 px-4 py-2 rounded text-sm md:text-lg">Session id: {sessionCode}</span>
        {currentSong ? (
            <YouTube 
              videoId={currentSong.videoId} 
              opts={opts}
              onEnd={handleEnd} 
              className="h-full w-full"/>       
        ) : (
            <div className="flex flex-col gap-y-6">
              <p className="text-center text-lg md:text-3xl font-bold text-white">Session id:  {sessionCode}</p>
              <p className="text-center text-lg md:text-2xl font-bold text-gray-400">Join the session then select a song</p>
            </div>
        )}
        </div>
    </div>
  );
}
