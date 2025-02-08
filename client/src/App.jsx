import "./App.css";

import {Routes, Route} from "react-router-dom";
import Layout from "./Layout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import {ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CreatePost from "./CreatePost.jsx";
import PostPage from "./pages/PostPage.jsx"
import ProfilePage from "./pages/ProfilePage.jsx";


const App = () => {
    return (
      <>
        <ToastContainer />

        <Routes>
          {/* Main layout route */}
          <Route path="/" element={<Layout />}>
            {/* Nested routes */}
            <Route index element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/create" element={<CreatePost />} />
            <Route path={"/post/:id"} element={<PostPage />} />
            <Route path={"/profile/:id"} element={<ProfilePage />} />
          </Route>

        </Routes>
      </>
    );
};

export default App;
