import { useEffect, useState } from 'react';
import { Spin, Modal, Input, DatePicker, Button, message, Tooltip } from 'antd';
import { formatISO9075 } from 'date-fns';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const ProfilePage = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const id = localStorage.getItem('id');
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    createdAt: null,
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!id) {
        setError('User ID not found. Redirecting...');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      try {
        const response = await fetch(
          `${apiUrl}/profile/${id}`,
          {
            credentials: 'include',
          },
        );
        if (!response.ok) {
          throw new Error('Failed to fetch profile data.');
        }
        const data = await response.json();
        setProfileData(data.user);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [id, navigate]);

  const handleEdit = () => {
    if (profileData) {
      setFormData({
        username: profileData.username || '',
        email: profileData.email || '',
        password: '',
        createdAt: profileData.createdAt ? moment(profileData.createdAt) : null,
      });
    }
    setIsModalVisible(true);
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await fetch(
        `${apiUrl}/profile/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password || undefined, // Only update password if provided
          }),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to update profile.');
      }

      const updatedData = await response.json();

      // 🔹 Ensure `createdAt` is properly formatted and stored
      setProfileData({
        ...updatedData.user,
        createdAt: updatedData.user.createdAt
          ? moment(updatedData.user.createdAt).format()
          : null,
      });

      toast.success('Profile updated successfully!');
      setIsModalVisible(false);
    } catch (error) {
      toast.error('Error updating profile.');
      console.error('Update Error:', error);
    }
  };

  const handleDeleteProfile = async () => {
    Modal.confirm({
      title: 'Are you sure you want to delete your profile?',
      content: 'This action is irreversible.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      async onOk() {
        try {
          const response = await fetch(
            `${apiUrl}/profile/${id}`,
            {
              method: 'DELETE',
            },
          );

          if (!response.ok) {
            throw new Error('Failed to delete profile.');
          }

          toast.success('Profile deleted successfully!');
          localStorage.removeItem('id'); // Remove user ID from local storage
          navigate('/login'); // Redirect to login page
        } catch (error) {
          toast.error('Error deleting profile.');
          console.error('Delete Error:', error);
        }
      },
    });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 font-semibold mt-10">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Profile</h1>
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="relative w-32 h-32 bg-blue-100 rounded-full flex justify-center items-center text-2xl font-bold text-blue-600">
          {profileData?.username ? profileData.username[0].toUpperCase() : 'U'}
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            {profileData?.username || 'Username not available'}
          </h2>
          <p className="text-gray-600">
            <strong>Email:</strong>{' '}
            {profileData?.email || 'Email not available'}
          </p>
          <p className="text-gray-600 mt-2">
            <strong>Created at:</strong>{' '}
            {profileData?.createdAt
              ? moment(profileData.createdAt).format('YYYY-MM-DD HH:mm:ss') // Ensure proper formatting
              : 'Not available'}
          </p>
        </div>
        <div>
          <Tooltip title="Edit Profile">
            <Button type="primary" onClick={handleEdit} className="mr-2">
              Edit Profile
            </Button>
          </Tooltip>

          <Tooltip title="Delete Profile">
            <Button
              type="danger"
              className="bg-red-400 hover:bg-red-500 duration-300 text-white"
              onClick={handleDeleteProfile}
            >
              Delete Profile
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Modal for Editing Profile */}
      <Modal
        title="Edit Profile"
        open={isModalVisible}
        onOk={handleUpdateProfile}
        onCancel={handleModalCancel}
      >
        <Input
          placeholder="Username"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
          className="mb-2"
        />
        <Input
          placeholder="Email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className="mb-2"
        />
        <Input.Password
          placeholder="New Password (optional)"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          className="mb-2"
        />
        <DatePicker
          placeholder="Created At (read-only)"
          value={formData.createdAt}
          disabled
          className="w-full"
        />
      </Modal>
    </div>
  );
};

export default ProfilePage;
