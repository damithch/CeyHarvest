import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/CropFeed.css';

const CropFeed = () => {
  const { user, getAuthHeaders } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({
    description: '',
    image: null,
    imagePreview: null
  });
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API base URL - will use relative paths for proxy
  const API_BASE = '';

  // Convert file to base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  // Fetch community feed
  const fetchCommunityFeed = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE}/api/farmer/${user.id}/community/feed`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          ...getAuthHeaders()
        }
      });

      if (response.ok) {
        const feedData = await response.json();
        // Transform backend data to frontend format
        const transformedPosts = feedData.map(post => ({
          id: post.id,
          farmer: {
            id: post.farmerId,
            name: post.farmerName,
            location: post.farmerLocation
          },
          description: post.description,
          image: post.imageBase64,
          createdAt: post.createdAt,
          likes: post.likes,
          comments: post.comments.map(comment => ({
            id: comment.id,
            user: comment.userName,
            text: comment.text,
            createdAt: comment.createdAt
          })),
          liked: post.likedByUserIds?.includes(user.id) || false,
          likedByUserIds: post.likedByUserIds || []
        }));
        setPosts(transformedPosts);
      } else {
        throw new Error('Failed to fetch community feed');
      }
    } catch (error) {
      console.error('Error fetching community feed:', error);
      setError('Failed to load community feed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.id) {
      fetchCommunityFeed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewPost({
        ...newPost,
        image: file,
        imagePreview: URL.createObjectURL(file)
      });
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.description.trim()) return;

    try {
      let imageBase64 = null;
      if (newPost.image) {
        imageBase64 = await convertToBase64(newPost.image);
      }

      const response = await fetch(`${API_BASE}/api/farmer/${user.id}/community/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          description: newPost.description,
          imageBase64: imageBase64
        })
      });

      if (response.ok) {
        const createdPost = await response.json();
        
        // Transform to frontend format and add to posts
        const transformedPost = {
          id: createdPost.id,
          farmer: {
            id: createdPost.farmerId,
            name: createdPost.farmerName,
            location: createdPost.farmerLocation
          },
          description: createdPost.description,
          image: createdPost.imageBase64,
          createdAt: createdPost.createdAt,
          likes: createdPost.likes,
          comments: [],
          liked: false,
          likedByUserIds: []
        };

        setPosts([transformedPost, ...posts]);
        setNewPost({
          description: '',
          image: null,
          imagePreview: null
        });
        setIsCreatingPost(false);
      } else {
        throw new Error('Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await fetch(`${API_BASE}/api/farmer/${user.id}/community/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          ...getAuthHeaders()
        }
      });

      if (response.ok) {
        const updatedPost = await response.json();
        
        // Update the post in the local state
        setPosts(posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              likes: updatedPost.likes,
              liked: updatedPost.likedByUserIds?.includes(user.id) || false,
              likedByUserIds: updatedPost.likedByUserIds || []
            };
          }
          return post;
        }));
      } else {
        throw new Error('Failed to toggle like');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      alert('Failed to update like. Please try again.');
    }
  };

  const handleComment = async (postId, commentText) => {
    if (!commentText.trim()) return;

    try {
      const response = await fetch(`${API_BASE}/api/farmer/${user.id}/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          text: commentText
        })
      });

      if (response.ok) {
        const updatedPost = await response.json();
        
        // Update the post in the local state
        setPosts(posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              comments: updatedPost.comments.map(comment => ({
                id: comment.id,
                user: comment.userName,
                text: comment.text,
                createdAt: comment.createdAt
              }))
            };
          }
          return post;
        }));
      } else {
        throw new Error('Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const Post = ({ post }) => {
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState('');

    const submitComment = () => {
      handleComment(post.id, newComment);
      setNewComment('');
    };

    return (
      <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden post-card">
        {/* Post Header */}
        <div className="p-4 border-b">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
              {post.farmer.name.charAt(0)}
            </div>
            <div className="ml-3">
              <h3 className="font-semibold text-gray-900">{post.farmer.name}</h3>
              <p className="text-sm text-gray-500">{post.farmer.location} • {formatDate(post.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div className="p-4">
          <p className="text-gray-800 mb-4">{post.description}</p>
        </div>

        {/* Post Image */}
        {post.image && (
          <div className="px-4 pb-4">
            <img 
              src={post.image} 
              alt="Crop" 
              className="w-full h-64 object-cover rounded-lg post-image"
            />
          </div>
        )}

        {/* Post Actions */}
        <div className="px-4 py-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleLike(post.id)}
                className={`flex items-center space-x-1 like-button ${
                  post.liked ? 'text-red-500' : 'text-gray-500'
                } hover:text-red-500 transition-colors`}
              >
                <span className="text-lg">{post.liked ? '❤️' : '🤍'}</span>
                <span className="text-sm font-medium">{post.likes}</span>
              </button>
              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors"
              >
                <span className="text-lg">💬</span>
                <span className="text-sm font-medium">{post.comments.length}</span>
              </button>
              <button className="flex items-center space-x-1 text-gray-500 hover:text-green-500 transition-colors">
                <span className="text-lg">📤</span>
                <span className="text-sm font-medium">Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="px-4 pb-4 border-t border-gray-100">
            {/* Existing Comments */}
            {post.comments.map(comment => (
              <div key={comment.id} className="py-2 border-b border-gray-50 last:border-b-0">
                <div className="flex items-start space-x-2">
                  <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-sm">
                    {comment.user.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-lg px-3 py-2 comment-bubble">
                      <p className="font-semibold text-sm text-gray-900">{comment.user}</p>
                      <p className="text-sm text-gray-800">{comment.text}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(comment.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Add Comment */}
            <div className="mt-3 flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 flex space-x-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-green-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      submitComment();
                    }
                  }}
                />
                <button
                  onClick={submitComment}
                  className="bg-green-500 text-white px-4 py-2 rounded-full text-sm hover:bg-green-600 transition-colors"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-6 crop-feed-container">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🌾</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading community feed...</h3>
          <p className="text-gray-600">Please wait while we fetch the latest updates</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-6 crop-feed-container">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading feed</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchCommunityFeed}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6 crop-feed-container">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">🌾 Crop Community Feed</h1>
        <p className="text-gray-600">Share your farming journey and connect with fellow farmers</p>
      </div>

      {/* Create Post Section */}
      <div className="bg-white rounded-lg shadow-md mb-6 p-4 create-post-area">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <button
            onClick={() => setIsCreatingPost(true)}
            className="flex-1 bg-gray-100 text-left px-4 py-3 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
          >
            Share your crop updates...
          </button>
        </div>

        {isCreatingPost && (
          <div className="border-t pt-4">
            <textarea
              value={newPost.description}
              onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
              placeholder="What's happening with your crops? Share your farming experience..."
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-green-500 resize-none"
              rows="3"
            />
            
            {newPost.imagePreview && (
              <div className="mt-3 relative">
                <img 
                  src={newPost.imagePreview} 
                  alt="Preview" 
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  onClick={() => setNewPost({ ...newPost, image: null, imagePreview: null })}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            )}

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-3">
                <label className="cursor-pointer text-green-600 hover:text-green-700">
                  <span className="text-lg">📸</span>
                  <span className="ml-1 text-sm">Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                <span className="text-green-600">
                  <span className="text-lg">📍</span>
                  <span className="ml-1 text-sm">Location</span>
                </span>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsCreatingPost(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePost}
                  disabled={!newPost.description.trim()}
                  className="share-button text-white px-6 py-2 rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Share
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Posts Feed */}
      <div>
        {posts.map(post => (
          <Post key={post.id} post={post} />
        ))}
      </div>

      {posts.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🌱</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
          <p className="text-gray-600">Be the first to share your crop updates!</p>
        </div>
      )}
    </div>
  );
};

export default CropFeed;
