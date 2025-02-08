const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const uploadMiddleware = multer({ dest: './uploads/' });
const fs = require('fs');
const Post = require('./models/Post');

const app = express();

// Middleware
app.use(express.json());
const allowedOrigins = [
  'http://localhost:5174',
  'http://localhost:5173',
  'http://localhost:5176',
];


app.use(
  cors({
    credentials: true,
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
  }),
);

app.use(cookieParser());
dotenv.config();
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(__dirname + '/uploads/'));

// -----------------
// AUTH & USER ROUTES
// -----------------

app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  console.log('Received data:', req.body); // Debugging line

  // Check if fields are empty
  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ success: false, message: 'All fields are required' });
  }

  try {
    // Check if email is already in use
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res
        .status(400)
        .json({ success: false, message: 'Email already exists' });
    }

    // Check if username is already in use
    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername) {
      return res
        .status(400)
        .json({ success: false, message: 'Username already exists' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    const userDoc = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    console.log(userDoc);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: { username, email },
    });
  } catch (error) {
    console.error('Signup Error:', error); // Log error for debugging
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Check if fields are empty
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: 'All fields are required' });
  }

  try {
    // Check if user exists
    const userDoc = await User.findOne({ email });
    if (!userDoc) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please register first.',
      });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, userDoc.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid email or password.' });
    }

    // Generate JWT token with 24-hour expiration
    const token = jwt.sign(
      {
        id: userDoc._id,
        email: userDoc.email,
        username: userDoc.username,
      },
      process.env.SECRET_KEY,
      { expiresIn: '24h' },
    );

    // Send cookie and response
    res.cookie('token', token, { httpOnly: true, sameSite: 'Strict' }).json({
      success: true,
      message: 'Login successful',
      user: {
        id: userDoc._id,
        username: userDoc.username,
        email: userDoc.email,
      },
    });
  } catch (error) {
    console.error('Error during login:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
});

app.get('/profile', (req, res) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided, please login first.',
    });
  }

  jwt.verify(token, process.env.SECRET_KEY, {}, (err, info) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Failed to authenticate token.',
      });
    }

    res.json({
      success: true,
      user: info,
    });
  });
});

app.post('/logout', (req, res) => {
  // Clearing the cookie by setting its value to an empty string and setting maxAge to 0
  return res
    .cookie('token', '')
    .json({ success: true, message: 'Logged out successfully.' });
});

// -----------------
// POST ROUTES
// -----------------

// Create a post
app.post('/post', uploadMiddleware.single('file'), async (req, res) => {
  try {
    const { token } = req.cookies;
    const { originalname, path } = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    const newPath = path + '.' + ext;
    fs.renameSync(path, newPath);

    jwt.verify(token, process.env.SECRET_KEY, {}, async (err, info) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: 'Failed to authenticate token.',
        });
      }

      const { title, summary, content } = req.body;
      if (!title || !summary || !content) {
        return res
          .status(400)
          .json({ success: false, message: 'All fields are required!' });
      }
      await Post.create({
        title: title,
        summary: summary,
        content: content,
        cover: newPath,
        author: info.id,
      });
      res
        .status(201)
        .json({ success: true, message: 'Post created successfully.' });
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Get list of posts
app.get('/post', async (req, res) => {
  const posts = await Post.find()
    .populate('author', ['username'])
    .sort({ createdAt: -1 })
    .limit(20);
  res.json(posts);
});

// Get a specific post by id
app.get('/post/:id', async (req, res) => {
  const id = req.params.id;
  const postDoc = await Post.findById(id);
  res.status(200).json(postDoc);
});

// Delete a post
app.delete('/post/:id', async (req, res) => {
  const { token } = req.cookies;
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: 'Not authenticated.' });
  }
  jwt.verify(token, process.env.SECRET_KEY, {}, async (err, info) => {
    if (err) {
      return res
        .status(403)
        .json({ success: false, message: 'Token verification failed.' });
    }
    try {
      const post = await Post.findById(req.params.id);
      if (!post) {
        return res
          .status(404)
          .json({ success: false, message: 'Post not found.' });
      }
      // Ensure the logged-in user is the author of the post
      if (post.author.toString() !== info.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this post.',
        });
      }
      await Post.findByIdAndDelete(req.params.id);
      return res.json({ success: true, message: 'Post deleted successfully.' });
    } catch (error) {
      console.error('Error deleting post:', error);
      return res
        .status(500)
        .json({ success: false, message: 'Internal server error.' });
    }
  });
});

// Update a post
app.put('/post/:id', uploadMiddleware.single('file'), async (req, res) => {
  const { token } = req.cookies;
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: 'Not authenticated.' });
  }
  jwt.verify(token, process.env.SECRET_KEY, {}, async (err, info) => {
    if (err) {
      return res
        .status(403)
        .json({ success: false, message: 'Token verification failed.' });
    }
    try {
      const post = await Post.findById(req.params.id);
      if (!post) {
        return res
          .status(404)
          .json({ success: false, message: 'Post not found.' });
      }
      // Ensure the logged-in user is the author of the post
      if (post.author.toString() !== info.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this post.',
        });
      }

      // Update provided fields
      const { title, summary, content } = req.body;
      if (title) post.title = title;
      if (summary) post.summary = summary;
      if (content) post.content = content;

      // If a new file is provided, process it and update the cover image
      if (req.file) {
        const { originalname, path } = req.file;
        const parts = originalname.split('.');
        const ext = parts[parts.length - 1];
        const newPath = path + '.' + ext;
        fs.renameSync(path, newPath);
        post.cover = newPath;
      }

      await post.save();
      return res.json({
        success: true,
        message: 'Post updated successfully.',
        post,
      });
    } catch (error) {
      console.error('Error updating post:', error);
      return res
        .status(500)
        .json({ success: false, message: 'Internal server error.' });
    }
  });
});

// -----------------
// PROFILE ROUTES
// -----------------

app.get('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userDoc = await User.findById(id);
    if (!userDoc) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found.' });
    }
    res.status(200).json({ success: true, user: userDoc });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.put('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password } = req.body;
    if (!username || !email) {
      return res
        .status(400)
        .json({ success: false, message: 'Username and email are required.' });
    }

    const userDoc = await User.findById(id);
    if (!userDoc) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found.' });
    }

    userDoc.username = username;
    userDoc.email = email;

    // If a password is provided, hash it before saving
    if (password) {
      const salt = await bcrypt.genSalt(10);
      userDoc.password = await bcrypt.hash(password, salt);
    }

    await userDoc.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: userDoc._id,
        username: userDoc.username,
        email: userDoc.email,
      },
    });
  } catch (e) {
    console.error('Error updating profile:', e);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error.' });
  }
});

app.delete('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the user exists
    const userDoc = await User.findById(id);
    if (!userDoc) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete the user
    await User.findByIdAndDelete(id);

    res.json({ message: 'Profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// -----------------
// MONGODB CONNECTION & SERVER START
// -----------------

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

app.listen(process.env.PORT || 4000, () => {
  console.log(`App Running on ${process.env.PORT}`);
});
