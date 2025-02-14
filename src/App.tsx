import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { ModeToggle } from "./components/mode-toggle";
import { LoginForm } from "./components/pages/LoginForm";
import { RegisterForm } from "./components/pages/RegisterForm";
import { Toaster } from "react-hot-toast";
import HomePage from "./components/pages/HomePage";
import ProfilePage from "./components/pages/ProfilePage";
import NotificationsPage from "./components/pages/NotificationsPage";
import StudentPage from "./components/pages/StudentPage";
import StudentList from "./components/pages/StudentList";
import StudentAttendance from "./components/pages/StudentAttendance";

function App() {
  return (
    <Router>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <div style={{ position: "relative", minHeight: "100vh" }}>
          <div style={{ position: "absolute", top: "1rem", right: "1rem" }}>
            <ModeToggle />
          </div>
          <main style={{ padding: "2rem" }}>
            <h1>App Name</h1>
            <Toaster />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegisterForm />} />
              <Route path="/profile" element={<ProfilePage/>} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/student/:studentId" element={<StudentPage />} />
              <Route path="/students" element={<StudentList />} />
              <Route path="/student/:studentID/attendance" element={<StudentAttendance />} />
            </Routes>
          </main>
        </div>
      </ThemeProvider>
    </Router>
  );
}

export default App;
