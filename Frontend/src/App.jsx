import "./App.css";
import LoginPage from "./Component/LoginPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignupPage from "./Component/SignupPage";
import Dashboard from "./Component/Dashboard";
function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/Signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
