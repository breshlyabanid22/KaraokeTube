import { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export default function SearchBar({ onSelect }) {
  const [query, setQuery] = useState("karaoke");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/youtube/search?q=${query}`);
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
        <input
          type="text"
          placeholder="Search YouTube songs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full p-2 rounded border border-gray-600"
        />
        <button type="submit" className="w-full bg-blue-500 rounded text-white py-2 hover:bg-blue-400">Search Songs</button>
      </form>

      {loading && <p>Loading...</p>}

      <ul className="flex flex-col gap-3 text-sm md:text-base">
        {results.map((video) => (
          <li key={video.videoId} className="flex flex-col gap-3 border border-gray-400 p-2">
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
