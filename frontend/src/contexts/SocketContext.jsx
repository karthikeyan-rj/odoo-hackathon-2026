import { createContext, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { token } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // In dev, Vite proxies socket.io to the local backend. In production, the
    // backend lives on a separate host, so VITE_API_URL must point at it.
    const socket = io(import.meta.env.VITE_API_URL || '/', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => console.log('[Socket] Connected:', socket.id));
    socket.on('connect_error', (err) => console.warn('[Socket] Error:', err.message));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  return (
    <SocketContext.Provider value={socketRef}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const ref = useContext(SocketContext);
  return ref?.current ?? null;
};
