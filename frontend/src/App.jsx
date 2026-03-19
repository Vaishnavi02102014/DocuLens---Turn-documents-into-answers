import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Home from "./pages/Home";
import ViewSummary from "./pages/ViewSummary";
import ChatPage from "./pages/ChatPage";
import Starred from "./pages/Starred";
import ProtectedRoute from "./components/ProtectedRoute";
import Account from "./pages/Account";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        {/*Home Page route */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        {/* View Summary Route */}
        <Route
          path="/summary/:filename"
          element={
            <ProtectedRoute>
              <ViewSummary />
            </ProtectedRoute>
          }
        />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/starred" element={<Starred />} />
        {/* Account Route */}
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;