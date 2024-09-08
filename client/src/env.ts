const serverUrl = import.meta.env.VITE_SERVER_URL
  ? (import.meta.env.VITE_SERVER_URL as string)
  : "http://localhost:8080";

if (!serverUrl && import.meta.env.PROD) {
  throw new Error("VITE_SERVER_URL missing");
}

export default {
  serverUrl: serverUrl as string,
};
