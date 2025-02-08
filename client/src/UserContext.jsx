import { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [userInfo, setUserInfo] = useState(null);

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
  }, []);

  // Function to update context after login
  const updateUser = (userData) => {
    setUserInfo(userData);
  };

  return (
    <UserContext.Provider value={{ userInfo, setUserInfo, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}
