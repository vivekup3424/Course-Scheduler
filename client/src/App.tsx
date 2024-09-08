import {
  createHashRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import Login from "./auth/Login";
import ProtectedRoutes from "./auth/ProtectedRoutes";
import SignUp from "./auth/SignUp";
import Root from "./home/Root";
import ColorSwitch from "./ui/ColorSwitch";

const browserRouter = createHashRouter(
  createRoutesFromElements(
    <>
      <Route element={<ProtectedRoutes />}>
        <Route path="/" element={<Root />} />
      </Route>
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
    </>
  )
);

function App() {
  return (
    <div className="App">
      <ColorSwitch />
      <RouterProvider router={browserRouter} />
    </div>
  );
}

export default App;
