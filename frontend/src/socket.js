import { io } from "socket.io-client";

const socket = io("http://localhost:4000"); // backend server URL
export default socket;
