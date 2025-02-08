import React, { useEffect, useState } from 'react';
import Post from '../Post';

const HomePage = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch posts function
  const fetchPosts = async () => {
    setLoading(true);
    setError(null); // Reset error before each fetch

    try {
      // Use credentials: 'include' to send cookies (like authentication tokens)
      const response = await fetch(`${apiUrl}/post`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setPosts(data); // Set the fetched posts to the state
    } catch (error) {
      setError('Failed to fetch posts'); // Set error state if request fails
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false); // Stop loading spinner after fetch completes (either success or error)
    }
  };

  useEffect(() => {
    fetchPosts(); // Fetch posts once on component mount
  }, []); // Empty dependency array ensures the effect runs only once

  return (
    <div>
      {/* Show loading state while fetching */}
      {loading && <p>Loading posts...</p>}

      {/* Show error message if something went wrong */}
      {error && <p>{error}</p>}

      {/* Render posts if available */}
      {posts.length > 0 ? (
        posts.map((post, idx) => (
          <div key={idx}>
            <Post post={post} />
          </div>
        ))
      ) : (
        <p>No posts available</p> // Message if there are no posts
      )}
    </div>
  );
};

export default HomePage;
