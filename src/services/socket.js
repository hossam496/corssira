import { io } from 'socket.io-client';

// Ensure socket connects to the root URL (without /api)
const socketURL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000').replace('/api', '');
const socket = io(socketURL, {
  transports: ['websocket', 'polling']
});

export const joinUserRoom = (userId) => {
  socket.emit('join', userId);
};

export default socket;
