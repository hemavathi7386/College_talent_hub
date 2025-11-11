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
  Trash2,
  Target,
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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      {/* Hero Section */}
      <div className="bg-gradient-hero border-b border-border">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
          <div className="text-center">
            <h1 className="text-3xl sm:text-5xl md:text-5xl font-bold text-text mb-4">Welcome back, <span className="text-primary">{user?.name}</span></h1>
            <p className="text-base sm:text-lg text-text-body mb-8 max-w-2xl mx-auto">
              {user?.role === 'student' && 'Discover opportunities and showcase your talents'}
              {user?.role === 'faculty' && 'Manage competitions and inspire students'}
              {user?.role === 'recruiter' && 'Find exceptional talent for your opportunities'}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 -mt-8 relative z-10">

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3 lg:gap-8 mb-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Create Post Section */}
          {!showCreatePost ? (
            <div className="bg-white rounded-lg shadow-sm border border-border p-4 sm:p-6">
              <button
                onClick={() => setShowCreatePost(true)}
                className="w-full text-left p-4 bg-background rounded-lg hover:bg-primary/5 transition-colors flex items-center space-x-4 border border-border"
              >
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <span className="text-text-muted">Share your achievements, projects, or thoughts...</span>
                </div>
                <Plus className="h-5 w-5 text-primary" />
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 md:p-8">
              <form onSubmit={handleCreatePost}>
                <div className="relative">
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="What's on your mind?"
                    className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                    rows="4"
                    autoFocus
                  />
                  <div className="absolute bottom-2 right-2 text-xs sm:text-sm text-gray-400">
                    {newPost.length}/500
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mt-4 sm:mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreatePost(false);
                      setNewPost('');
                    }}
                    className="px-4 py-2 sm:px-6 sm:py-3 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newPost.trim()}
                    className="w-full sm:w-auto px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    Share Post
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Posts Feed */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
                <TrendingUp className="h-6 w-6 text-primary mr-2" />
                Recent Posts
              </h2>
            </div>
            
            {posts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-10 md:p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Posts Yet</h3>
                <p className="text-gray-600 mb-6">Be the first to share something with the community!</p>
                <button
                  onClick={() => setShowCreatePost(true)}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
                >
                  Create First Post
                </button>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 md:p-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {post.user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-bold text-gray-900 text-base sm:text-lg">{post.user?.name}</h3>
                          <span className="px-3 py-1 bg-gray-100 text-primary text-sm font-medium rounded-full capitalize">{post.user?.role}</span>
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
                      <p className="text-gray-700 mt-4 text-base sm:text-lg leading-relaxed">{post.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6 lg:gap-8 mt-6 pt-6 border-t border-gray-100">
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
                          className="flex items-center space-x-3 px-4 py-2 rounded-lg text-gray-500 hover:text-primary hover:bg-primary-light transition-colors"
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
                                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
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
                                    <p className="text-gray-700 text-sm">{comment.text}</p>
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
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post._id)}
                                />
                                <button
                                  onClick={() => handleAddComment(post._id)}
                                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
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
        <div className="lg:col-span-1 space-y-6 sm:space-y-8">
          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
              <Target className="h-6 w-6 text-primary mr-2" />
              Quick Overview
            </h3>
            <div className="space-y-4">
              <div 
                onClick={() => navigate('/jobs')}
                className="bg-cyan-50 rounded-lg p-4 hover:bg-cyan-100 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Briefcase className="h-5 w-5 text-primary" />
                    <span className="font-medium text-gray-700">Available Jobs</span>
                  </div>
                  <span className="text-2xl font-bold text-primary">{recentJobs.length}</span>
                </div>
              </div>
              <div 
                onClick={() => navigate('/competitions')}
                className="bg-amber-50 rounded-lg p-4 hover:bg-amber-100 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    <span className="font-medium text-gray-700">Active Competitions</span>
                  </div>
                  <span className="text-2xl font-bold text-amber-500">{recentCompetitions.length}</span>
                </div>
              </div>
              <div 
                onClick={() => navigate('/profile')}
                className="bg-slate-50 rounded-lg p-4 hover:bg-slate-100 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-slate-600" />
                    <span className="font-medium text-gray-700">Your Skills</span>
                  </div>
                  <span className="text-2xl font-bold text-slate-600">{user?.skills?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Jobs */}
          {recentJobs.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
                <Briefcase className="h-6 w-6 text-primary mr-2" />
                Recent Opportunities
              </h3>
              <div className="space-y-4">
                {recentJobs.slice(0, 3).map((job) => (
                  <div 
                    key={job._id} 
                    onClick={() => navigate('/jobs')}
                    className="bg-cyan-50 rounded-lg p-4 border-l-4 border-primary hover:bg-cyan-100 transition-colors cursor-pointer">
                    <h4 className="font-bold text-gray-900 mb-2">{job.title}</h4>
                    <p className="text-primary font-medium mb-1">{job.company}</p>
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 bg-white text-primary text-sm font-medium rounded-full capitalize">{job.type}</span>
                      <ArrowRight className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Competitions */}
          {recentCompetitions.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
                <Trophy className="h-6 w-6 text-amber-500 mr-2" />
                Upcoming Competitions
              </h3>
              <div className="space-y-4">
                {recentCompetitions.slice(0, 3).map((competition) => (
                  <div 
                    key={competition._id} 
                    onClick={() => navigate('/competitions')}
                    className="bg-amber-50 rounded-lg p-4 border-l-4 border-amber-500 hover:bg-amber-100 transition-colors cursor-pointer">
                    <h4 className="font-bold text-gray-900 mb-2">{competition.title}</h4>
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="h-4 w-4 text-amber-500" />
                      <p className="text-amber-600 font-medium">{formatDate(competition.date)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 bg-white text-amber-600 text-sm font-medium rounded-full capitalize">{competition.category}</span>
                      <ArrowRight className="h-4 w-4 text-amber-500" />
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
