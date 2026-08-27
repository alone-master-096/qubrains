import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute, PublicOnlyRoute } from "./components/common/RouteGuards";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import AppShell from "./components/home/AppShell";
import Home from "./components/home/Home";
import ChatList from "./components/chat/ChatList";
import ChatWindow from "./components/chat/ChatWindow";
import Notifications from "./components/notifications/Notifications";
import Profile from "./components/profile/Profile";
import Settings from "./components/settings/Settings";

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <Register />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path="chats" element={<ChatList />} />
        <Route path="chats/:conversationId" element={<ChatWindow />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
