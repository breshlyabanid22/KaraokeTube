import { createContext, useContext, useState } from "react";

const SongContext = createContext();

export function SongProvider({ children }) {
  const [currentSong, setCurrentSong] = useState(null);
  return (
    <SongContext.Provider value={{ currentSong, setCurrentSong }}>
      {children}
    </SongContext.Provider>
  );
}

export function useSong() {
  return useContext(SongContext);
}