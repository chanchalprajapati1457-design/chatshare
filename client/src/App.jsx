import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api/posts";
const SERVER_URL = "http://localhost:5000";

function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [commentText, setCommentText] = useState({});

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok) {
        throw new Error("Failed to load posts");
      }

      setPosts(data);
    } catch (error) {
      console.error("LOAD POSTS ERROR:", error);
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handlePost = async () => {
    if (!image) {
      alert("Please select an image first.");
      return;
    }

    const formData = new FormData();

    formData.append("image", image);
    formData.append("caption", caption);

    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Upload failed");
      }

      setPosts((oldPosts) => [data, ...oldPosts]);

      setImage(null);
      setPreview(null);
      setCaption("");

      alert("Post shared successfully! 🎉");
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await fetch(
        `${API_URL}/${postId}/like`,
        {
          method: "PUT",
        }
      );

      const updatedPost = await response.json();

      if (!response.ok) {
        throw new Error(
          updatedPost.message || "Failed to like post"
        );
      }

      setPosts((oldPosts) =>
        oldPosts.map((post) =>
          post._id === updatedPost._id
            ? updatedPost
            : post
        )
      );
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const handleDelete = async (postId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this post?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/${postId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete post"
        );
      }

      setPosts((oldPosts) =>
        oldPosts.filter((post) => post._id !== postId)
      );

      alert("Post deleted successfully! 🗑️");
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const handleCommentChange = (postId, value) => {
    setCommentText((oldComments) => ({
      ...oldComments,
      [postId]: value,
    }));
  };

  const handleComment = async (postId) => {
    const text = commentText[postId]?.trim();

    if (!text) {
      alert("Please write a comment first.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/${postId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: text,
          }),
        }
      );

      const updatedPost = await response.json();

      if (!response.ok) {
        throw new Error(
          updatedPost.message || "Failed to add comment"
        );
      }

      setPosts((oldPosts) =>
        oldPosts.map((post) =>
          post._id === updatedPost._id
            ? updatedPost
            : post
        )
      );

      setCommentText((oldComments) => ({
        ...oldComments,
        [postId]: "",
      }));
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  return (
    <div className="app">
      <header className="navbar">
        <div className="logo">ChatShare</div>

        <nav>
          <button className="nav-btn active">Home</button>
          <button className="nav-btn">Explore</button>
          <button className="nav-btn"
                  onClick={() => alert("Profile page coming next! 👤")}
>
                  Profile
          </button>
        </nav>

        <div className="avatar">A</div>
      </header>

      <main className="main-content">
        <section className="welcome">
          <p className="eyebrow">WELCOME BACK 👋</p>

          <h1>Share your moments.</h1>

          <p className="subtitle">
            Post your favorite memories and connect with your friends.
          </p>
        </section>

        <section className="upload-card">
          <div className="upload-icon">＋</div>

          <div className="upload-content">
            <h2>Create a new post</h2>

            <p>
              Share an image and tell everyone what’s on your mind.
            </p>

            <input
              className="caption-input"
              type="text"
              placeholder="Write a caption..."
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
            />

            {preview && (
              <img
                className="image-preview"
                src={preview}
                alt="Preview"
              />
            )}

            <div className="upload-actions">
              <label className="image-btn">
                📷 Add Image

                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageChange}
                />
              </label>

              <button
                className="post-btn"
                onClick={handlePost}
                disabled={loading}
              >
                {loading ? "Uploading..." : "Share Post"}
              </button>
            </div>
          </div>
        </section>

        <section className="feed-header">
          <div>
            <p className="eyebrow">YOUR FEED</p>
            <h2>Recent posts</h2>
          </div>
        </section>

        {loadingPosts ? (
          <section className="empty-feed">
            <div className="empty-icon">⏳</div>
            <h3>Loading your feed...</h3>
          </section>
        ) : posts.length === 0 ? (
          <section className="empty-feed">
            <div className="empty-icon">📸</div>

            <h3>Your feed is waiting for you</h3>

            <p>
              Upload your first photo and start building your
              ChatShare story.
            </p>
          </section>
        ) : (
          <section className="posts">
            {posts.map((post) => (
              <article className="post-card" key={post._id}>
                <img
                  src={SERVER_URL + post.image}
                  alt="Shared post"
                />

                {post.caption && (
                  <p className="post-caption">
                    {post.caption}
                  </p>
                )}

                <div className="post-actions">
                  <button
                    onClick={() => handleLike(post._id)}
                  >
                    ❤️ Like {post.likes || 0}
                  </button>

                  <button
                    onClick={() =>
                      document
                        .getElementById(`comment-${post._id}`)
                        ?.focus()
                    }
                  >
                    💬 Comment
                  </button>

                  <button>
                    ↗ Share
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(post._id)}
                  >
                    🗑️ Delete
                  </button>
                </div>

                <div className="comment-box">
                  <input
                    id={`comment-${post._id}`}
                    type="text"
                    placeholder="Write a comment..."
                    value={commentText[post._id] || ""}
                    onChange={(event) =>
                      handleCommentChange(
                        post._id,
                        event.target.value
                      )
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        handleComment(post._id);
                      }
                    }}
                  />

                  <button
                    onClick={() => handleComment(post._id)}
                  >
                    Post
                  </button>
                </div>

                {post.comments && post.comments.length > 0 && (
                  <div className="comments-list">
                    {post.comments.map((comment, index) => (
                      <div
                        className="comment"
                        key={comment._id || index}
                      >
                        💬 {comment.text}
                      </div>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

export default App;