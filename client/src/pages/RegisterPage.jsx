import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"; // Importing the eye icons
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [user, setUser] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false); // State for password visibility

  const navigate = useNavigate();
  const getValue = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const register = async (e) => {
    e.preventDefault();
    if (!user.username.trim() && !user.password.trim() && !user.email.trim()) {
      return toast.error("All feild's are required please fill them");
    }

    try {
      const response = await fetch(
        `${apiUrl}/signup`,
        {
          method: 'POST',
          body: JSON.stringify(user),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const data = await response.json();
      console.log('Server Response:', data); // 👈 Debugging line

      if (!response.ok) {
        toast.error(data.message || 'An error occurred during registration.');
        return;
      }

      // Show success toast
      toast.success('Registration successful! Welcome aboard.');
      navigate('/login');
      console.log('Registration successful:', data);

      // Clear form fields after successful registration
      setUser({ username: '', email: '', password: '' });
    } catch (error) {
      toast.error("Failed to connect to the server. Please try again.");
      console.error("Error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      {/* Toast Container */}
      <ToastContainer />

      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Create an Account
        </h1>

        <form onSubmit={register}>
          {/* Username Field */}
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <input
              name="username"
              value={user.username}
              onChange={getValue}
              type="text"
              id="username"
              placeholder="Enter your username"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>

          {/* Email Field */}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              name="email"
              value={user.email}
              onChange={getValue}
              type="email"
              id="email"
              placeholder="Enter your email"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>

          {/* Password Field */}
          <div className="mb-6 relative">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              name="password"
              value={user.password}
              onChange={getValue}
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="Enter your password"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 top-5 flex items-center text-gray-500 hover:text-black"
            >
              {showPassword ? (
                <AiOutlineEyeInvisible size={24} />
              ) : (
                <AiOutlineEye size={24} />
              )}
            </button>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-600 transition duration-300 font-semibold"
          >
            Register
          </button>
        </form>

        {/* Additional Links */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-blue-500 font-semibold hover:underline"
            >
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
