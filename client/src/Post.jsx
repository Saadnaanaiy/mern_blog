import { formatISO9075 } from "date-fns";
import { Link } from "react-router-dom";
import { Card, Avatar } from "antd";

const { Meta } = Card;

const Post = ({ post }) => {
    const { _id, title, summary, cover, content, createdAt, author } = post;

    return (
        <Card
            hoverable
            className="mb-6 shadow-lg rounded-lg"
            cover={
                <Link to={`/post/${_id}`}>
                    <img
                        src={`http://localhost:5000/${cover}`}
                        alt="Post Cover"
                        className="rounded-t-lg object-cover h-64 w-full"
                    />
                </Link>
            }
        >
            <Meta

                avatar={<Avatar className={"bg-blue-400"}>{author?.username?.[0]?.toUpperCase() || "U"}</Avatar>}
                title={
                    <h2 className="text-lg font-semibold">
                        <Link to={`/post/${_id}`} className="text-blue-600">
                            {title}
                        </Link>
                    </h2>
                }
                description={
                    <div>
                        <div className="text-gray-500 text-sm mb-3">
                            <span>By </span>
                            <span className="font-medium">{author?.username || "Anonymous"}</span>
                            <span> • </span>
                            <time>{formatISO9075(new Date(createdAt))}</time>
                        </div>
                        <p className="text-gray-700 text-sm mb-2">{summary}</p>

                    </div>
                }
            />
        </Card>
    );
};

export default Post;
