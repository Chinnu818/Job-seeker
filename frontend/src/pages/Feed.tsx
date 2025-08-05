import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/axios';
import { 
  EyeIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
  ShareIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

interface Post {
  _id: string;
  content: {
    text: string;
    media?: Array<{
      type: string;
      url: string;
    }>;
  };
  type: string;
  author: {
    profile: {
      firstName: string;
      lastName: string;
      avatar?: string;
      headline?: string;
    };
  };
  hashtags: string[];
  tags: string[];
  likes: Array<{
    user: {
      profile: {
        firstName: string;
        lastName: string;
      };
    };
  }>;
  comments: Array<{
    _id: string;
    content: string;
    author: {
      profile: {
        firstName: string;
        lastName: string;
        avatar?: string;
      };
    };
    createdAt: string;
  }>;
  createdAt: string;
  engagement: {
    totalLikes: number;
    totalComments: number;
    totalShares: number;
  };
}

interface FeedStats {
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalViews: number;
}

const Feed: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'my-posts' | 'trending'>('all');
  const [newPost, setNewPost] = useState({
    content: '',
    type: 'general',
    visibility: 'public'
  });
    const [filters] = useState({
    type: '',
    author: '',
    tags: '',
    hashtags: ''
  });


  // Calculate feed stats with null checks
  const feedStats: FeedStats = {
    totalPosts: posts?.length || 0,
    totalLikes: posts?.reduce((sum, post) => sum + (post.engagement?.totalLikes || 0), 0) || 0,
    totalComments: posts?.reduce((sum, post) => sum + (post.engagement?.totalComments || 0), 0) || 0,
    totalViews: posts?.reduce((sum, post) => sum + (post.engagement?.totalShares || 0), 0) || 0
  };

  // Fetch posts
  const fetchPosts = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...filters
      });

      const response = await api.get(`/posts?${params}`);
      setPosts(response.data.posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [filters, user]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.content.trim()) return;

    try {
      const response = await api.post('/posts', {
        content: { text: newPost.content },
        type: newPost.type,
        visibility: newPost.visibility
      });

      setPosts(prev => [response.data.post, ...prev]);
      setNewPost({ content: '', type: 'general', visibility: 'public' });
      setShowCreatePost(false);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await api.put(`/posts/${postId}/like`, {});
      
      // Update local state
      setPosts(prev => prev.map(post => {
        if (post._id === postId) {
          const isLiked = post.likes.some(like => 
            like.user.profile.firstName === user?.firstName
          );
          
          if (isLiked) {
            return {
              ...post,
              likes: post.likes.filter(like => 
                like.user.profile.firstName !== user?.firstName
              ),
              engagement: {
                ...post.engagement,
                totalLikes: post.engagement.totalLikes - 1
              }
            };
          } else {
                          return {
                ...post,
                likes: [...post.likes, { user: { profile: { firstName: user?.firstName || '', lastName: user?.lastName || '' } } }],
                engagement: {
                  ...post.engagement,
                  totalLikes: post.engagement.totalLikes + 1
                }
              };
          }
        }
        return post;
      }));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };



  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return `${Math.floor(diffInHours / 168)}w ago`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.02,
      y: -2,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  const statVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.05,
      y: -3,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">Authentication Required</h2>
          <p className="text-gray-300 mb-6">You need to be logged in to view the feed.</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
          >
            Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <motion.div 
          className="mb-6 sm:mb-8"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div 
            className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-4 sm:mb-6"
            variants={itemVariants}
          >
            <div className="p-2 sm:p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
              <ChatBubbleLeftRightIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">Professional Feed</h1>
              <p className="text-gray-300 text-sm sm:text-lg">Connect with your network and discover opportunities</p>
            </div>
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreatePost(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center space-x-2"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Create Post</span>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div
            variants={statVariants}
            whileHover="hover"
            className="bg-gradient-to-br from-gray-800/50 to-purple-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-purple-500/20 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm sm:text-base">Total Posts</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{feedStats.totalPosts}</p>
              </div>
              <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                <ChatBubbleLeftRightIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={statVariants}
            whileHover="hover"
            className="bg-gradient-to-br from-gray-800/50 to-purple-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-purple-500/20 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm sm:text-base">Total Likes</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{feedStats.totalLikes}</p>
              </div>
              <div className="p-2 sm:p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                <HeartIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={statVariants}
            whileHover="hover"
            className="bg-gradient-to-br from-gray-800/50 to-purple-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-purple-500/20 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm sm:text-base">Total Comments</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{feedStats.totalComments}</p>
              </div>
              <div className="p-2 sm:p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                <ChatBubbleLeftRightIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={statVariants}
            whileHover="hover"
            className="bg-gradient-to-br from-gray-800/50 to-purple-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-purple-500/20 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm sm:text-base">Total Views</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{feedStats.totalViews}</p>
              </div>
              <div className="p-2 sm:p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
                <EyeIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div 
          className="mb-6 sm:mb-8"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <div className="flex space-x-1 bg-gray-800/50 rounded-xl p-1">
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('all')}
              className={`flex-1 px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 ${
                activeTab === 'all'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              All Posts
            </motion.button>
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('my-posts')}
              className={`flex-1 px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 ${
                activeTab === 'my-posts'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              My Posts
            </motion.button>
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('trending')}
              className={`flex-1 px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 ${
                activeTab === 'trending'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              Trending
            </motion.button>
          </div>
        </motion.div>

        {/* Create Post Modal */}
        <AnimatePresence>
          {showCreatePost && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowCreatePost(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gradient-to-br from-gray-800 to-purple-800 rounded-xl shadow-xl w-full max-w-2xl border border-purple-500/20"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Create a Post
                  </h3>
                  <form onSubmit={handleCreatePost}>
                    <div className="mb-4">
                      <textarea
                        value={newPost.content}
                        onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Share your thoughts, achievements, or career updates..."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
                      />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowCreatePost(false)}
                        className="px-4 py-2 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
                      >
                        Post
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Posts */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
          ) : posts.length === 0 ? (
            <motion.div 
              className="text-center py-12"
              variants={itemVariants}
            >
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No posts yet
              </h3>
              <p className="text-gray-300">
                Be the first to share something with your network!
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {posts.map((post) => (
                <motion.div
                  key={post._id}
                  variants={cardVariants}
                  whileHover="hover"
                  className="bg-gradient-to-br from-gray-800/50 to-purple-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-purple-500/20 shadow-xl"
                >
                  {/* Post Header */}
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {post.author.profile.firstName[0]}{post.author.profile.lastName[0]}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-white">
                          {post.author.profile.firstName} {post.author.profile.lastName}
                        </p>
                        {post.author.profile.headline && (
                          <span className="text-sm text-gray-400">
                            • {post.author.profile.headline}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">
                        {getTimeAgo(post.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="mb-4">
                    <p className="text-white whitespace-pre-wrap">
                      {post.content.text}
                    </p>
                  </div>

                  {/* Hashtags */}
                  {post.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {post.hashtags.map((hashtag, hashtagIndex) => (
                        <span
                          key={hashtagIndex}
                          className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30"
                        >
                          {hashtag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Engagement Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                    <div className="flex items-center space-x-4">
                      <span>{post.engagement.totalLikes} likes</span>
                      <span>{post.engagement.totalComments} comments</span>
                      <span>{post.engagement.totalShares} shares</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-4 pt-4 border-t border-gray-600/50">
                    <button
                      onClick={() => handleLike(post._id)}
                                              className={`flex items-center space-x-2 text-sm font-medium transition-colors ${
                          post.likes.some(like => like.user.profile.firstName === user?.firstName)
                            ? 'text-purple-400'
                            : 'text-gray-400 hover:text-purple-400'
                        }`}
                    >
                      <HeartIcon className="w-4 h-4" />
                      <span>Like</span>
                    </button>
                    <button className="flex items-center space-x-2 text-sm font-medium text-gray-400 hover:text-purple-400 transition-colors">
                      <ChatBubbleLeftRightIcon className="w-4 h-4" />
                      <span>Comment</span>
                    </button>
                    <button className="flex items-center space-x-2 text-sm font-medium text-gray-400 hover:text-purple-400 transition-colors">
                      <ShareIcon className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                  </div>

                  {/* Comments */}
                  {post.comments.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-600/50">
                      <div className="space-y-3">
                        {post.comments.slice(0, 3).map((comment) => (
                          <div key={comment._id} className="flex space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center text-gray-300 text-sm font-medium">
                                {comment.author.profile.firstName[0]}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="bg-gray-700/50 rounded-lg px-3 py-2 border border-gray-600/50">
                                <p className="text-sm font-medium text-white">
                                  {comment.author.profile.firstName} {comment.author.profile.lastName}
                                </p>
                                <p className="text-sm text-gray-300">{comment.content}</p>
                              </div>
                              <p className="text-xs text-gray-400 mt-1">
                                {getTimeAgo(comment.createdAt)}
                              </p>
                            </div>
                          </div>
                        ))}
                        {post.comments.length > 3 && (
                          <p className="text-sm text-purple-400 cursor-pointer">
                            View {post.comments.length - 3} more comments
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Feed; 