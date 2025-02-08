import { useContext, useState } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';

const LoginPage = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  console.log(apiUrl)
  const { setUserInfo } = useContext(UserContext); // Get the context function to set user info
  const [user, setUser] = useState({
    email: '',
    password: '',
  });
  const [isPasswordShowed, setIsPasswordShowed] = useState(false); // To toggle password visibility
  const [isLoading, setIsLoading] = useState(false); // To manage loading state
  const navigate = useNavigate(); // For navigating to the homepage on successful login

  const getValue = (event) => {
    const { name, value } = event.target;
    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const login = async (e) => {
    e.preventDefault();

    // Validation checks
    if (!user.email.trim() || !user.password.trim()) {
      message.error('Both email and password are required.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(user.email)) {
      message.error('Please enter a valid email address.');
      return;
    }
    if (user.password.length < 6) {
      message.error('Password must be at least 6 characters long.');
      return;
    }

    try {
      setIsLoading(true); // Set loading to true while making the request
      const response = await fetch(
        `${apiUrl}/login`, // Use your backend login URL
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include credentials (cookies) in the request
          body: JSON.stringify(user),
        },
      );

      // Check if the response is OK
      if (!response.ok) {
        const errorData = await response.text(); // Read the response as text
        message.error(errorData || 'An error occurred while signing in.');
        return;
      }

      // Check if the response body contains any content
      const data = await response.json().catch((error) => {
        message.error('Failed to parse the server response.');
        console.error('Error parsing response:', error);
        return null; // Return null if parsing fails
      });

      // If data is null (parsing failed), do not continue
      if (!data) return;

      // Update user context after successful login
      setUserInfo(data.user);
      message.success('Login successful! Welcome back, ' + data.user.username);

      // Store user ID in localStorage
      localStorage.setItem('id', data.user.id);

      // Redirect to home page
      navigate('/');

      // Clear form fields after successful login
      setUser({ email: '', password: '' });
    } catch (error) {
      message.error('Failed to connect to the server. Please try again.');
      console.error('Error:', error);
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Sign In
        </h1>

        <form onSubmit={login}>
          {/* Email Field */}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              value={user.email}
              name="email"
              onChange={getValue}
              type="email"
              id="email"
              placeholder="Enter your email"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              disabled={isLoading}
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
              value={user.password}
              name="password"
              onChange={getValue}
              type={isPasswordShowed ? 'text' : 'password'}
              id="password"
              placeholder="Enter your password"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              disabled={isLoading}
            />

            {/* Password Toggle Icon */}
            <button
              type="button"
              onClick={() => setIsPasswordShowed(!isPasswordShowed)}
              className="absolute inset-y-0 right-3 top-6 flex items-center text-gray-500 hover:text-black"
              disabled={isLoading}
            >
              {isPasswordShowed ? (
                <AiOutlineEyeInvisible size={24} />
              ) : (
                <AiOutlineEye size={24} />
              )}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full py-2 px-4 rounded-md font-semibold transition duration-300 ${
              isLoading
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-black text-white hover:bg-gray-600'
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Additional Links */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <a
              href="/register"
              className="text-blue-500 font-semibold hover:underline"
            >
              Register here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
