import React, { createContext, useContext, useState, ReactNode } from 'react';
import axios from 'axios';

interface Comment {
  _id: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
}

interface Post {
  _id: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  content: string;
  type: 'text' | 'image' | 'video' | 'link';
  visibility: 'public' | 'connections' | 'private';
  tags: string[];
  mentions: string[];
  likes: string[];
  comments: Comment[];
  shares: number;
  createdAt: string;
  updatedAt: string;
}

interface PostContextType {
  posts: Post[];
  loading: boolean;
  error: string | null;
  fetchPosts: (filters?: PostFilters) => Promise<void>;
  createPost: (postData: CreatePostData) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
  unlikePost: (postId: string) => Promise<void>;
  addComment: (postId: string, content: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
}

interface PostFilters {
  type?: string;
  author?: string;
  page?: number;
  limit?: number;
}

interface CreatePostData {
  content: string;
  type?: 'text' | 'image' | 'video' | 'link';
  visibility?: 'public' | 'connections' | 'private';
  tags?: string[];
  mentions?: string[];
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const usePost = () => {
  const context = useContext(PostContext);
  if (context === undefined) {
    throw new Error('usePost must be used within a PostProvider');
  }
  return context;
};

interface PostProviderProps {
  children: ReactNode;
}

export const PostProvider: React.FC<PostProviderProps> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async (filters?: PostFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }

      const response = await axios.get(`/api/posts?${params.toString()}`);
      setPosts(response.data.posts || response.data);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (postData: CreatePostData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post('/api/posts', postData);
      setPosts(prev => [response.data, ...prev]);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create post');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const likePost = async (postId: string) => {
    try {
      setError(null);
      
      const response = await axios.put(`/api/posts/${postId}/like`);
      
      // Update the post in the list
      setPosts(prev => prev.map(post => {
        if (post._id === postId) {
          return response.data;
        }
        return post;
      }));
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to like post');
      throw error;
    }
  };

  const unlikePost = async (postId: string) => {
    try {
      setError(null);
      
      const response = await axios.put(`/api/posts/${postId}/like`);
      
      // Update the post in the list
      setPosts(prev => prev.map(post => {
        if (post._id === postId) {
          return response.data;
        }
        return post;
      }));
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to unlike post');
      throw error;
    }
  };

  const addComment = async (postId: string, content: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`/api/posts/${postId}/comment`, { content });
      
      // Update the post in the list
      setPosts(prev => prev.map(post => {
        if (post._id === postId) {
          return response.data;
        }
        return post;
      }));
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to add comment');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (postId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await axios.delete(`/api/posts/${postId}`);
      
      // Remove the post from the list
      setPosts(prev => prev.filter(post => post._id !== postId));
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to delete post');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: PostContextType = {
    posts,
    loading,
    error,
    fetchPosts,
    createPost,
    likePost,
    unlikePost,
    addComment,
    deletePost
  };

  return (
    <PostContext.Provider value={value}>
      {children}
    </PostContext.Provider>
  );
}; 