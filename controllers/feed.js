import Post from '../models/post.js';
import User from '../models/user.js';
import { getIO } from '../socket.js';

// GET all posts
export const getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find().populate('creator');
    res.status(200).json({ posts });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

// CREATE a post
export const createPost = async (req, res, next) => {
  try {
    const title = req.body.title;
    const content = req.body.content;
    const imageUrl = req.file?.path || 'images/default.png';

    const post = new Post({
      title,
      content,
      imageUrl,
      creator: req.userId,
    });

    await post.save();

    const user = await User.findById(req.userId);
    user.posts.push(post);
    const savedUser = await user.save();

    // 🔥 socket event
    getIO().emit('posts', { action: 'create', post });

    res.status(201).json({
      message: 'Post created successfully!',
      post,
      creator: { _id: user._id, name: user.name },
    });

    // Return user so tests can check `.posts`
    return savedUser;
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

// GET single post
export const getPost = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const post = await Post.findById(postId).populate('creator');
    if (!post) {
      const error = new Error('Post not found.');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ post });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

// GET user status ✅
export const getUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ status: user.status });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};
