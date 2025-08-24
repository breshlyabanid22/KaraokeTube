import { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const CHANNELS = [
  {id: "UCJw1qyMF4m3ZIBWdhogkcsw", name: "MusisiKaraoke"},
  {id: "UCNbFgUCJj2Ls6LVzBbL8fqA", name: "KaraokeyTV"},
  {id: "UCutZyApGOjqhOS-pp7yAj4Q", name: "Atomic Karaoke"},
  {id: "UC-BjrRzAujV2glTNKcwEG0g", name: "RyScape STUDIO"},
  {id: "UCLibmOHbJSf1EAke-seSp8A", name: "Global KaraokeyTV"},
]
  

export default function SearchBar({ onSelect }) {
  const [query, setQuery] = useState("karaoke");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(CHANNELS[0].id);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/youtube/search?q=${encodeURIComponent(query)}&channelId=${selectedChannel}`);
      setResults(res.data);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-bar w-full flex flex-col gap-2">
      <form onSubmit={handleSearch} className="flex flex-col gap-2">
        <p>Select a youtube channel: </p>
        <select
          value={selectedChannel}
          onChange={e => setSelectedChannel(e.target.value)}
          className="p-2 rounded bg-slate-500 text-white focus:bg-slate-600 focus:outline-none border-none"
        >
          {CHANNELS.map(channel => (
            <option 
              key={channel.id} 
              value={channel.id}
              >{channel.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Search for songs, artists..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full p-2 rounded focus:outline-none border border-zinc-100 bg-zinc-200"
        />
        <button type="submit" className="w-full bg-blue-500 rounded text-white py-2 hover:bg-blue-400">Search Songs</button>
      </form>

      {loading && <p>Loading...</p>}

      <ul className="flex flex-col gap-3 text-sm md:text-base">
        {results.map((video, idx) => (
          <li key={idx} className="flex flex-col gap-3 border border-gray-400 p-2">
            <img src={video.thumbnail} alt={video.title} className="w-full object-contain md:max-w-40" />
            <div className="flex flex-col gap-1 w-full">
              <h4>{video.title}</h4>
              <small>{video.channel}</small>
              <button 
                onClick={() => onSelect(video)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded "
                >Add to Queue</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
