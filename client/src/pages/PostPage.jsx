import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Skeleton,
  Typography,
  Divider,
  message,
  Modal,
  Button,
  Form,
  Input,
  Upload,
  Tooltip,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;

export default function PostPage() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [postInfo, setPostInfo] = useState(null); // Post data state
  const [loading, setLoading] = useState(true); // Loading state
  const { id } = useParams(); // Post id from URL
  const navigate = useNavigate();

  // State for update modal visibility and form management
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [updateForm] = Form.useForm();

  // State for file upload (new cover image) and cover preview URL
  const [updatedFile, setUpdatedFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  // Function to fetch post data from the backend
  const fetchData = async () => {
    try {
      const response = await fetch(`${apiUrl}/post/${id}`, {
        credentials: 'include', // include cookies
      });
      if (!response.ok) {
        throw new Error('Failed to fetch post data');
      }
      const data = await response.json();
      setPostInfo(data);
    } catch (error) {
      message.error('Failed to fetch post data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  // Utility function to strip HTML tags from a string
  const stripHtmlTags = (html) => {
    return html.replace(/<\/?[^>]+(>|$)/g, '');
  };

  // Handler for showing update modal and pre-filling form fields
  const showUpdateModal = () => {
    // Remove any HTML tags from the content field before pre-filling the form
    const plainContent = stripHtmlTags(postInfo.content);
    updateForm.setFieldsValue({
      title: postInfo.title,
      summary: postInfo.summary,
      content: plainContent,
    });
    // Set the preview to the current cover image from the post
    setCoverPreview(`${apiUrl}/${postInfo.cover}`);
    setIsUpdateModalVisible(true);
  };

  // Handler for closing the update modal
  const handleUpdateCancel = () => {
    setIsUpdateModalVisible(false);
    setUpdatedFile(null);
    setCoverPreview(null);
  };

  // Handler for submitting the update form
  // Handler for submitting the update form

  const handleUpdateSubmit = async (values) => {
    try {
      const formData = new FormData();

      // Add updated fields if they are different
      if (values.title !== postInfo.title)
        formData.append('title', values.title);
      if (values.summary !== postInfo.summary)
        formData.append('summary', values.summary);
      if (values.content !== postInfo.content)
        formData.append('content', values.content);

      // If the user has uploaded a new file, append it to the form data
      if (updatedFile) {
        formData.append('file', updatedFile); // Note: 'file' should match the backend field name
      }

      // Make the API request
      const response = await fetch(`${apiUrl}/post/${id}`, {
        method: 'PUT',
        credentials: 'include', // Include cookies for authentication
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update the post.');
      }

      const result = await response.json();

      if (result.success) {
        message.success(result.message || 'Post updated successfully.');
        setPostInfo(result.post); // Update postInfo with the new data from backend
        setIsUpdateModalVisible(false); // Close the modal
        setUpdatedFile(null); // Reset file state
        setCoverPreview(null); // Reset preview
      } else {
        throw new Error(result.message || 'Post update failed.');
      }
    } catch (error) {
      message.error(error.message || 'Update failed. Please try again.');
    }
  };


  // Handler for delete action
  const handleDelete = () => {
    Modal.confirm({
      title: 'Confirm Deletion',
      content: 'Are you sure you want to delete this post?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          const response = await fetch(`${apiUrl}/post/${id}`, {
            method: 'DELETE',
            credentials: 'include',
          });
          if (!response.ok) {
            throw new Error('Failed to delete the post.');
          }
          const result = await response.json();
          message.success(result.message || 'Post deleted successfully.');
          // Redirect to home (or another page) after deletion
          navigate('/');
        } catch (error) {
          message.error(error.message || 'Deletion failed. Please try again.');
        }
      },
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  if (!postInfo) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Typography.Text type="danger">Post not found.</Typography.Text>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Post Container */}
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg overflow-hidden relative">
        {/* Cover Image */}
        <div className="h-64 md:h-96">
          <img
            src={`http://localhost:5000/${postInfo.cover}`}
            alt={postInfo.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Edit/Delete Icons (positioned at top-right over the image) */}
        <div className="absolute top-4 left-4 flex space-x-2">
          <Tooltip title="Edit Post">
            <Button
              shape="circle"
              icon={<EditOutlined />}
              onClick={showUpdateModal}
            />
          </Tooltip>
          <Tooltip title="Delete Post">
            <Button
              shape="circle"
              danger
              icon={<DeleteOutlined />}
              onClick={handleDelete}
            />
          </Tooltip>
        </div>

        {/* Post Content */}
        <div className="p-6 md:p-10">
          {/* Post Title */}
          <Title level={2} className="text-gray-800">
            {postInfo.title}
          </Title>

          {/* Post Summary */}
          <Paragraph type="secondary" className="italic text-lg mb-4">
            {postInfo.summary}
          </Paragraph>

          <Divider />

          {/* Post Body */}
          <div
            className="post-content text-gray-700 text-base leading-relaxed"
            dangerouslySetInnerHTML={{ __html: postInfo.content }}
          ></div>
        </div>
      </div>

      {/* Update Post Modal */}
      <Modal
        title="Update Post"
        visible={isUpdateModalVisible}
        onCancel={handleUpdateCancel}
        footer={null}
      >
        <Form form={updateForm} layout="vertical" onFinish={handleUpdateSubmit}>
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: 'Please input the title!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Summary"
            name="summary"
            rules={[{ required: true, message: 'Please input the summary!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Content"
            name="content"
            rules={[{ required: true, message: 'Please input the content!' }]}
          >
            <Input.TextArea rows={6} />
          </Form.Item>

          <Form.Item label="Cover Image (optional)">
            <Upload
              beforeUpload={(file) => {
                // Prevent auto-upload and update preview
                setUpdatedFile(file);
                const previewUrl = URL.createObjectURL(file);
                setCoverPreview(previewUrl);
                return false;
              }}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Select File</Button>
            </Upload>
            {coverPreview && (
              <div style={{ marginTop: 10 }}>
                <img
                  src={coverPreview}
                  alt="Cover Preview"
                  style={{
                    width: '100%',
                    maxHeight: '200px',
                    objectFit: 'cover',
                  }}
                />
              </div>
            )}
          </Form.Item>

          <Form.Item>
            <div className="flex justify-end space-x-2">
              <Button onClick={handleUpdateCancel}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Update Post
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
