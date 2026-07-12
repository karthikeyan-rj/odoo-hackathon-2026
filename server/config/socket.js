/**
 * socket.js — singleton that holds the Socket.io Server instance.
 * Services call getIO() to emit events without circular dependencies.
 */
let _io = null;

const init = (io) => {
  _io = io;
};

const getIO = () => {
  if (!_io) throw new Error('Socket.io not initialized yet');
  return _io;
};

module.exports = { init, getIO };
