// socket.js
import { Server } from 'socket.io';

let io;

export const init = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*', // allow all origins (you can restrict this later)
    },
  });
  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
