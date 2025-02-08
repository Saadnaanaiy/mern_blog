import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Avatar,
  Button,
  Modal,
  Form,
  Input,
  Upload,
  message,
} from 'antd';
import {
  UserOutlined,
  UploadOutlined,
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons';

const Profile = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  console.log(id)
  // Fetch Profile Data
  const fetchProfile = async () => {
    if (!id) {
      console.error('Profile ID is undefined.');
      return;
    }
    try {
      const response = await fetch(`${apiUrl}/profile/${id}`);
      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();
      setProfile(data);
      setLoading(false);
    } catch (error) {
      message.error('Error fetching profile.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  // Handle Profile Update
  const handleUpdate = async (values) => {
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('email', values.email);
      formData.append('bio', values.bio);

      // Handle avatar update (if provided)
      if (values.avatar?.file) {
        formData.append('avatar', values.avatar.file);
      }

      const response = await fetch(`${apiUrl}/profile/${id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to update profile');

      message.success('Profile updated successfully!');
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      message.error('Error updating profile.');
    }
  };

  // Handle Profile Deletion
  const handleDelete = async () => {
    try {
      const response = await fetch(
        `${apiUrl}/profile/${id}`,
        {
          method: 'DELETE',
        },
      );

      if (!response.ok) throw new Error('Failed to delete profile');

      message.success('Profile deleted successfully!');
      navigate('/'); // Redirect after deletion
    } catch (error) {
      message.error('Error deleting profile.');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      {loading ? (
        <p>Loading...</p>
      ) : profile ? (
        <Card className="w-full max-w-md shadow-lg">
          <div className="flex flex-col items-center">
            <Avatar
              size={100}
              src={`http://localhost:5000/${profile.avatar}`}
              icon={<UserOutlined />}
            />
            <h2 className="text-xl font-semibold mt-4">{profile.name}</h2>
            <p className="text-gray-500">{profile.email}</p>
            <p className="text-gray-700 mt-2">{profile.bio}</p>
          </div>

          <div className="flex justify-between mt-4">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
            <Button
              type="danger"
              icon={<DeleteOutlined />}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </Card>
      ) : (
        <p className="text-center text-red-500">Profile not found.</p>
      )}

      {/* Update Profile Modal */}
      <Modal
        title="Edit Profile"
        open={isEditing}
        onCancel={() => setIsEditing(false)}
        onOk={() => form.submit()}
      >
        <Form
          form={form}
          initialValues={{
            name: profile?.name,
            email: profile?.email,
            bio: profile?.bio,
          }}
          onFinish={handleUpdate}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Name is required' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, type: 'email', message: 'Enter a valid email' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="bio" label="Bio">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="avatar" label="Profile Picture">
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>Upload New Image</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Profile;
