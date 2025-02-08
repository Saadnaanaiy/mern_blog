import { Link, useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState, useRef } from 'react';
import { UserContext } from './UserContext';
import { message } from 'antd';

export default function Header() {
  const { setUserInfo, userInfo } = useContext(UserContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetch('http://localhost:5000/profile', {
      credentials: 'include',
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setUserInfo(data.user);
        } else {
          setUserInfo(null);
        }
      })
      .catch(() => {
        setUserInfo(null);
      });
  }, [setUserInfo]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  function logout() {
    fetch('http://localhost:5000/logout', {
      credentials: 'include',
      method: 'POST',
    }).then(() => {
      setUserInfo(null);
      message.success('You logged out successfully.');
      navigate('/login');
    });
  }

  const username = userInfo?.username;

  return (
    <header className="flex items-center justify-between px-4 py-2 bg-gray-50 text-white rounded-2xl">
      <Link to="/" className="text-black logo text-2xl font-bold">
        MyBlog
      </Link>

      <nav className="flex items-center space-x-4">
        {username ? (
          <>
            <Link to="/create" className="text-black hover:text-blue-400">
              Create new post
            </Link>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="dropdown-toggle flex items-center space-x-2 bg-slate-600 px-3 py-2 rounded-md hover:bg-gray-600 transition 300"
              >
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white text-lg">
                    {username[0].toUpperCase()}
                  </span>
                </div>
                <span>{username}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="dropdown__list rounded-md dropdown absolute right-0 mt-2 bg-gray-300 text-gray-800 shadow-lg w-48 z-10">
                  <Link
                    to={`/profile/${userInfo?._id}`}
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/create"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Create New Post
                  </Link>
                  <Link to="/" className="block px-4 py-2 hover:bg-gray-100">
                    Blog's
                  </Link>
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="text-black hover:text-blue-400">
              Login
            </Link>
            <Link to="/register" className="text-black hover:text-blue-400">
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
