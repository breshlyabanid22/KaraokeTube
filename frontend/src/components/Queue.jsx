import React, { useEffect, useState, useRef} from 'react'
import { useSong } from './SongProvider';


export const Queue = ({socket, sessionCode, hideUI}) => {

    const [queue, setQueue] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const { currentSong, setCurrentSong } = useSong();
    const queueRef = useRef(queue); 

    useEffect(() => {
      queueRef.current = queue;
    }, [queue]);
    
    useEffect(() => {
      if(!socket) return;

        if (queue.length > 0 && !currentSong) {
            setCurrentSong(queue[0]);
        }
        const handleVideoPlaying = ({ videoId }) => {
          const song = queueRef.current.find((s) =>  s.videoId === videoId);
          if(song){
            setCurrentSong(song);
        }
       }
        socket.on("videoPlaying", handleVideoPlaying);

        socket.on("queueUpdated", (updatedQueue) => {
            setQueue(updatedQueue);
            if(updatedQueue.length > 0 && !currentSong){
              const song = updatedQueue[0];
              setCurrentSong(song)
              setIsPlaying(true);
            }
        });

        socket.on("songPlayed", (playedSong) => {
          if(queueRef.current.length > 0){
            const nextSong = queueRef.current[0];
            setCurrentSong(nextSong);
          }else{
            setCurrentSong(null);

          }
        })

        return () => {
            socket.off("videoPlaying");
            socket.off("queueUpdated");
            socket.off("songPlayed");
        }
    }, [socket, sessionCode, currentSong])
    
    const handlePlay = (videoId, title) => {
      const song = {videoId, title}
      setCurrentSong(song);
      setIsPlaying(true);
      socket.emit("playVideo", {sessionCode, videoId});
      socket.emit("nextSong", {sessionCode, videoId});
    }

  return (
    <> 
    {currentSong && !hideUI && (
      <div className="sticky bottom-3 top-2 rounded-full mt-5 mx-auto text-xs md:text-sm bg-indigo-700 text-center text-white p-3 ">
        NOW PLAYING : {currentSong?.title} - by {currentSong?.addedBy}
      </div>
    )}
    {!hideUI && (
      <div className="mt-6 h-screen" id="queue">
      <h2 className="text-lg font-bold">Queue</h2>  
      {queue.length === 0 ? (
        <p>No songs in queue yet</p>
      ) : (
        <ul className="space-y-2">
          {queue.map((song, idx) => (
            <>
            <li key={idx} className="flex flex-col gap-1 justify-between border p-2 rounded text-xs overflow-hidden text-ellipsis">
              🎵 {song.title} <span className="text-sm text-gray-500">(added by {song.addedBy})</span>
              <button 
              onClick={() => handlePlay(song.videoId, song.title)}
              className="bg-red-500 text-white px-4 py-2 min-w-10 rounded hover:bg-red-400"
              >Play Now
              </button>
            </li>
            </>
          ))}
        </ul>
      )}
    </div>
    )}
    </>
 )
}
