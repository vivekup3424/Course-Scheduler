import { Center, Spinner } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import env from "../env";
import { useScheduleStore } from "../home/schedule-store";
import { useAuthStore } from "./auth-store";
import { loginSchema } from "./authSchemas";
import { saveToken } from "./jwt";

export default function ProtectedRoutes() {
  const [loading, setLoading] = useState(true);
  const { token, loggedIn } = useAuthStore();

  useEffect(() => {
    if (loggedIn) return;
    fetch(`${env.serverUrl}/api/auth/login`, {
      headers: { authorization: `Bearer ${token}` },
    })
      .then(response => response.json())
      .then(data => {
        const parsedData = loginSchema.parse(data);
        if ("errorMessage" in parsedData) {
          throw new Error(parsedData.errorMessage);
        }
        saveToken(parsedData.token);
        useAuthStore.setState({
          loggedIn: parsedData.loggedIn,
          username: parsedData.username,
          token: parsedData.token,
        });
        useScheduleStore.setState({ courses: parsedData.courses });
      })
      .catch(console.log)
      .finally(() => {
        setLoading(false);
      });
  }, [token, loggedIn]);

  if (loading && !loggedIn) {
    return (
      <Center h="100vh">
        <Spinner size="xl" speed="0.65s" variant="" color="blue.200" />
      </Center>
    );
  }

  return loggedIn ? <Outlet /> : <Navigate to="/signup" />;
}
