import { io, Socket } from "socket.io-client";

// Connexion WebSocket unique, partagée par toute l'application. Utilise le
// même cookie httpOnly "access_token" que les requêtes REST (withCredentials)
// — aucune authentification séparée à gérer côté client.
let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const url = process.env.NEXT_PUBLIC_API_URL || "https://api.senedoc.net";
    socket = io(url, { withCredentials: true, autoConnect: true });
  }
  return socket;
}
