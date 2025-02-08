import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Input, Upload, Button, Form } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// ReactQuill Modules and Formats
const modules = {
    toolbar: [
        [{ header: [1, 2, false] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
        ["link", "image"],
        ["clean"],
    ],
};

const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
];

export default function CreatePost() {
    const [title, setTitle] = useState("");
    const [summary, setSummary] = useState("");
    const [content, setContent] = useState("");
    const [file, setFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null); // State for image preview
    const navigate = useNavigate();

    // File Upload Handler
    const handleFileChange = (info) => {
        if (info.fileList.length > 0) {
            const file = info.fileList[0].originFileObj;
            setFile(file); // Save the file object
            setImagePreview(URL.createObjectURL(file)); // Generate preview URL
        } else {
            setFile(null);
            setImagePreview(null); // Clear preview when no file is selected
        }
    };

    // Form Submit Handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.set("title", title);
        data.set("summary", summary);
        data.set("content", content);
        if (file) {
            data.set("file", file); // Append the file if selected
        }

        try {
            const response = await fetch("http://localhost:5000/post", {
                method: "POST",
                body: data, // Send the FormData directly
                credentials: "include",
            });
            if (response.ok) {
                toast.success("Post created successfully!");
                // Clear the form fields if needed
                setTitle("");
                setSummary("");
                setContent("");
                setFile(null);
                setImagePreview(null); // Clear the image preview
                navigate("/");
            } else {
                toast.error("Error creating post");
            }
        } catch (error) {
            toast.error("Error creating post: " + error.message);
        }
    };

    return (
        <div className="min-h-screen flex justify-center">
            <div className="bg-white rounded-lg p-10 w-full max-w-4xl">
                <h2 className="text-3xl font-bold text-gray-700 text-center">Create a New Post</h2>
                <Form layout="vertical" onSubmitCapture={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <Form.Item label="Title" required>
                        <Input
                            placeholder="Enter your post title here..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="rounded-md"
                        />
                    </Form.Item>

                    {/* Summary */}
                    <Form.Item label="Summary" required>
                        <Input
                            placeholder="Provide a short summary for your post..."
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                            className="rounded-md"
                        />
                    </Form.Item>

                    {/* File Upload */}
                    <Form.Item label="Upload Image" required>
                        <Upload
                            beforeUpload={() => false}
                            onChange={handleFileChange}
                            maxCount={1}
                            accept="image/*"
                        >
                            <div  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition">
                                <UploadOutlined className="text-blue-500 text-4xl mb-2" />
                                <p className="text-gray-600">Click or Drag Image to Upload</p>
                                <p className="text-xs text-gray-400">PNG, JPG, JPEG (max 5MB)</p>
                            </div>
                        </Upload>
                        {/* Image Preview */}
                        {imagePreview && (
                            <div className="mt-4">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="max-h-52 w-auto rounded-md shadow-md"
                                />
                            </div>
                        )}
                    </Form.Item>

                    {/* ReactQuill Editor */}
                    <Form.Item label="Content" required>
                        <div className="border rounded-md overflow-hidden">
                            <ReactQuill
                                value={content}
                                onChange={setContent}
                                modules={modules}
                                formats={formats}
                                theme="snow"
                                placeholder="Write your post content here..."
                            />
                        </div>
                    </Form.Item>

                    {/* Submit Button */}
                    <div className="text-center">
                        <Button
                            style={{ width: "300px", fontWeight: "bold" }}
                            type="primary"
                            htmlType="submit"
                            className="font-mono bg-blue-500 hover:bg-blue-600 px-8 py-2 text-white rounded-md shadow-md transition"
                        >
                            Create Post
                        </Button>
                    </div>
                </Form>
            </div>
        </div>
    );
}
