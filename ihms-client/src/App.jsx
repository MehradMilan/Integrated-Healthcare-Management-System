import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { Toaster } from "react-hot-toast";
import { Protected, Public, Admin } from "./middleware/route";
import React, { lazy, Suspense } from "react";
import Loading from "./components/Loading";
import { CookiesProvider, useCookies } from 'react-cookie'

// const Home = lazy(() => import("./pages/Home"));
const GuardianDashboard = lazy(() => import("./pages/Guardian-Dashboard"));
const AdminDashboard = lazy(() => import("./pages/Admin-Dashboard"));
// const Appointments = lazy(() => import("./pages/Appointments"));
// const Doctors = lazy(() => import("./pages/Doctors"));
// const Profile = lazy(() => import("./pages/Profile"));
// const Notifications = lazy(() => import("./pages/Notifications"));
// const ApplyDoctor = lazy(() => import("./pages/ApplyDoctor"));
const Error = lazy(() => import("./pages/Error"));

function App() {

  return (
    <Router>
      <Toaster />
      <Suspense fallback={<Loading />}>
        <Routes>
          {<Route
            path="/login"
            element={
              <Public>
                <Login />
              </Public>
            }
          />}
          <Route
            path="/register"
            element={
              <Public>
                <Register />
              </Public>
            }
          />
          <Route
            path="/guardian-dashboard"
            element={
              <Public>
                <GuardianDashboard />
              </Public>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <Public>
                <AdminDashboard />
              </Public>
            }
          />
           {/* <Route
            path="/"
            element={
              <>
              <div>
                <a href="https://vitejs.dev" target="_blank">
                  <img src={viteLogo} className="logo" alt="Vite logo" />
                </a>
                <a href="https://react.dev" target="_blank">
                  <img src={reactLogo} className="logo react" alt="React logo" />
                </a>
              </div>
              <h1>Vite + React</h1>
              <div className="card">
                <button onClick={() => setCount((count) => count + 1)}>
                  count is {count}
                </button>
                <p>
                  Edit <code>src/App.jsx</code> and save to test HMR
                </p>
              </div>
              <p className="read-the-docs">
                Click on the Vite and React logos to learn more
              </p>
            </>
            }
          /> */}
          {/*<Route
            path="/doctors"
            element={<Doctors />}
          />
          <Route
            path="/appointments"
            element={
              <Protected>
                <Appointments />
              </Protected>
            }
          />
          <Route
            path="/notifications"
            element={
              <Protected>
                <Notifications />
              </Protected>
            }
          />
          <Route
            path="/applyfordoctor"
            element={
              <Protected>
                <ApplyDoctor />
              </Protected>
            }
          />
          <Route
            path="/profile"
            element={
              <Protected>
                <Profile />
              </Protected>
            }
          />
          <Route
            path="/dashboard/users"
            element={
              <Admin>
                <Dashboard type={"users"} />
              </Admin>
            }
          />
          <Route
            path="/dashboard/doctors"
            element={
              <Admin>
                <Dashboard type={"doctors"} />
              </Admin>
            }
          />
          <Route
            path="/dashboard/appointments"
            element={
              <Protected>
                <Dashboard type={"appointments"} />
              </Protected>
            }
          />
          <Route
            path="/dashboard/applications"
            element={
              <Protected>
                <Dashboard type={"applications"} />
              </Protected>
            }
          /> */}
          <Route
            path="*"
            element={<Error />}
          />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;