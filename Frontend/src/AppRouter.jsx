import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import Explore from "./pages/Explore.jsx";
import Profile from "./pages/Profile.jsx";
import CreateGroup from "./pages/CreateGroup.jsx";
import Workspace from "./pages/Workspace.jsx";
import Landing from "./pages/Landing.jsx"
import ErrorUrl from "./components/ErrorUrl.jsx";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
          <Route index element={<Explore />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/create-group" element={<CreateGroup />} />
          <Route path="/workspace" element={<Workspace />} />
          <Route path="/home" element={<Landing/>} />
          <Route path="/dashboard" element={<Explore/>} />
          <Route path="*" element={<ErrorUrl />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
