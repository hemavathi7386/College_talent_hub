import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Users,
  Briefcase,
  Trophy,
  TrendingUp,
  Calendar,
  Award,
  Bell,
  Trash2,
  Sparkles,
  Target,
  Zap,
  Star,
  ArrowRight,
  Plus
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentCompetitions, setRecentCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showComments, setShowComments] = useState({});
  const [newComment, setNewComment] = useState({});

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [postsRes, jobsRes, competitionsRes] = await Promise.all([
        axios.get('/api/posts?limit=5'),
        axios.get('/api/jobs?limit=3'),
        axios.get('/api/competitions?limit=3')
      ]);

      setPosts(postsRes.data.posts || []);
      setRecentJobs(jobsRes.data.jobs || []);
      setRecentCompetitions(competitionsRes.data.competitions || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      const response = await axios.post('/api/posts', {
        description: newPost
      });
      
      setPosts([response.data, ...posts]);
      setNewPost('');
      setShowCreatePost(false);
      toast.success('Post created successfully!');
    } catch (error) {
      toast.error('Failed to create post');
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const response = await axios.put(`/api/posts/${postId}/like`);
      setPosts(posts.map(post => 
        post._id === postId ? response.data : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('Failed to like post');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      await axios.delete(`/api/posts/${postId}`);
      setPosts(posts.filter(post => post._id !== postId));
      toast.success('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const toggleComments = (postId) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleAddComment = async (postId) => {
    const commentText = newComment[postId];
    if (!commentText?.trim()) return;
    
    try {
      const response = await axios.post(`/api/posts/${postId}/comment`, {
        text: commentText
      });
      
      // Update the post with new comment
      setPosts(posts.map(post => {
        if (post._id === postId) {
          return {
            ...post,
            comments: [...(post.comments || []), response.data]
          };
        }
        return post;
      }));
      
      setNewComment(prev => ({ ...prev, [postId]: '' }));
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleSharePost = (post) => {
    if (navigator.share) {
      navigator.share({
        title: `Post by ${post.user.name}`,
        text: post.description,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      const shareText = `Check out this post by ${post.user.name}: ${post.description}`;
      navigator.clipboard.writeText(shareText).then(() => {
        toast.success('Post content copied to clipboard!');
      }).catch(() => {
        toast.error('Failed to share post');
      });
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 animate-fade-in">Welcome back, <span className="text-yellow-300">{user?.name}</span>!</h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              {user?.role === 'student' && 'Discover opportunities and showcase your talents'}
              {user?.role === 'faculty' && 'Manage competitions and inspire students'}
              {user?.role === 'recruiter' && 'Find exceptional talent for your opportunities'}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-8 relative z-10">

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Create Post Section */}
          {!showCreatePost ? (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <button
                onClick={() => setShowCreatePost(true)}
                className="w-full text-left p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-4"
              >
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-lg">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <span className="text-gray-500 text-lg">Share your achievements, projects, or thoughts...</span>
                </div>
                <Plus className="h-6 w-6 text-blue-600" />
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
              <form onSubmit={handleCreatePost}>
                <div className="relative">
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="What's on your mind?"
                    className="w-full p-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-lg"
                    rows="4"
                    autoFocus
                  />
                  <div className="absolute bottom-3 right-3 text-sm text-gray-400">
                    {newPost.length}/500
                  </div>
                </div>
                <div className="flex justify-between items-center mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreatePost(false);
                      setNewPost('');
                    }}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-all duration-300 rounded-lg hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newPost.trim()}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    <Zap className="h-5 w-5" />
                    <span>Share Post</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Posts Feed */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <div className="p-2 bg-blue-600 rounded-lg mr-3">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                Recent Posts
              </h2>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>Latest updates from your network</span>
              </div>
            </div>
            
            {posts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Available Jobs</h3>
                <p className="text-gray-600 mb-6">Be the first to share something amazing with the community!</p>
                <button
                  onClick={() => setShowCreatePost(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create First Post
                </button>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post._id} className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-lg">
                        {post.user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-bold text-gray-900 text-lg">{post.user?.name}</h3>
                          <span className="px-3 py-1 bg-gray-100 text-blue-600 text-sm font-medium rounded-full capitalize">{post.user?.role}</span>
                          <span className="text-sm text-gray-400">•</span>
                          <span className="text-sm text-gray-500 font-medium">{formatDate(post.createdAt)}</span>
                        </div>
                        {post.user?._id === user?.id && (
                          <button
                            onClick={() => handleDeletePost(post._id)}
                            className="text-gray-400 hover:text-red-500 transition-all duration-300 p-2 rounded-lg hover:bg-red-50 transform hover:scale-110"
                            title="Delete post"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                      <p className="text-gray-700 mt-4 text-lg leading-relaxed">{post.description}</p>
                      
                      <div className="flex items-center space-x-8 mt-6 pt-6 border-t border-gray-100">
                        <div className="relative group">
                          <button
                            onClick={() => handleLikePost(post._id)}
                            className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                              post.likes?.some(like => like.user === user?.id)
                                ? 'text-red-600 bg-red-50 hover:bg-red-100'
                                : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                            }`}
                          >
                            <Heart className={`h-5 w-5 ${post.likes?.some(like => like.user === user?.id) ? 'fill-red-500 text-red-500' : ''}`} />
                            <span className="font-medium">{post.likes?.length || 0}</span>
                          </button>
                          {post.likes?.length > 0 && (
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                              Liked by: {post.likes.map(like => like.user?.name).filter(name => name).join(', ')}
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                            </div>
                          )}
                        </div>
                        <button 
                          onClick={() => toggleComments(post._id)}
                          className="flex items-center space-x-3 px-4 py-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <MessageCircle className="h-5 w-5" />
                          <span className="font-medium">{post.comments?.length || 0}</span>
                        </button>
                        <button 
                          onClick={() => handleSharePost(post)}
                          className="flex items-center space-x-3 px-4 py-2 rounded-lg text-gray-500 hover:text-green-600 hover:bg-green-50 transition-colors"
                        >
                          <Share2 className="h-5 w-5" />
                          <span className="font-medium">Share</span>
                        </button>
                        {(user?.role === 'admin' || post.user._id === user?.id) && (
                          <button 
                            onClick={() => handleDeletePost(post._id)}
                            className="flex items-center space-x-3 px-4 py-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                            <span className="font-medium">Delete</span>
                          </button>
                        )}
                      </div>
                      
                      {/* Comments Section */}
                      {showComments[post._id] && (
                        <div className="mt-6 pt-6 border-t border-gray-100">
                          <div className="space-y-4">
                            {/* Existing Comments */}
                            {post.comments?.map((comment, index) => (
                              <div key={index} className="flex space-x-3">
                                <div className="flex-shrink-0">
                                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-semibold">
                                      {comment.user?.name?.charAt(0) || 'U'}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <span className="font-medium text-sm text-gray-900">
                                        {comment.user?.name || 'Unknown User'}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {new Date(comment.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <p className="text-gray-500 text-sm">New opportunities waiting</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                            
                            {/* Add Comment */}
                            <div className="flex space-x-3">
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                  <span className="text-white text-sm font-semibold">
                                    {user?.name?.charAt(0) || 'U'}
                                  </span>
                                </div>
                              </div>
                              <div className="flex-1 flex space-x-2">
                                <input
                                  type="text"
                                  value={newComment[post._id] || ''}
                                  onChange={(e) => setNewComment(prev => ({
                                    ...prev,
                                    [post._id]: e.target.value
                                  }))}
                                  placeholder="Write a comment..."
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post._id)}
                                />
                                <button
                                  onClick={() => handleAddComment(post._id)}
                                  className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 shadow-lg"
                                >
                                  Post
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <div className="p-2 bg-blue-600 rounded-lg mr-3">
                <Target className="h-6 w-6 text-white" />
              </div>
              Quick Overview
            </h3>
            <div className="space-y-6">
              <div 
                onClick={() => navigate('/jobs')}
                className="bg-blue-50 rounded-lg p-4 hover:bg-blue-100 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <Briefcase className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-medium text-gray-700">Available Jobs</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">{recentJobs.length}</span>
                </div>
              </div>
              <div 
                onClick={() => navigate('/competitions')}
                className="bg-green-50 rounded-lg p-4 hover:bg-green-100 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-600 rounded-lg">
                      <Trophy className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-medium text-gray-700">Active Competitions</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">{recentCompetitions.length}</span>
                </div>
              </div>
              <div 
                onClick={() => navigate('/profile')}
                className="bg-purple-50 rounded-lg p-4 hover:bg-purple-100 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-medium text-gray-700">Your Skills</span>
                  </div>
                  <span className="text-2xl font-bold text-purple-600">{user?.skills?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Jobs */}
          {recentJobs.length > 0 && (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="p-2 bg-blue-600 rounded-lg mr-3">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                Recent Opportunities
              </h3>
              <div className="space-y-4">
                {recentJobs.slice(0, 3).map((job) => (
                  <div 
                    key={job._id} 
                    onClick={() => navigate('/jobs')}
                    className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500 hover:bg-blue-100 transition-colors cursor-pointer">
                    <h4 className="font-bold text-gray-900 text-lg mb-2">{job.title}</h4>
                    <p className="text-blue-600 font-medium mb-1">{job.company}</p>
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full capitalize">{job.type}</span>
                      <ArrowRight className="h-4 w-4 text-blue-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Competitions */}
          {recentCompetitions.length > 0 && (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="p-2 bg-green-600 rounded-lg mr-3">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                Upcoming Competitions
              </h3>
              <div className="space-y-4">
                {recentCompetitions.slice(0, 3).map((competition) => (
                  <div 
                    key={competition._id} 
                    onClick={() => navigate('/competitions')}
                    className="bg-blue-600 rounded-lg p-4 border-l-4 border-green-500 hover:bg-green-100 transition-colors cursor-pointer">
                    <h4 className="font-bold text-gray-900 text-lg mb-2">{competition.title}</h4>
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="h-4 w-4 text-yellow-600" />
                      <p className="text-green-600 font-medium">{formatDate(competition.date)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full capitalize">{competition.category}</span>
                      <ArrowRight className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default Dashboard;
