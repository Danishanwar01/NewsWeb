// app.js
const express = require('express');
const connectDB = require('./db/conn');

const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Admin = require('./models/Admin');
const Article = require('./models/Article');
const Carousel = require('./models/Carousel');

const app = express();




// —— Middlewares ——
app.use(express.json());
app.use(cors());

// —— Uploads Folder Setup ——
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// —— Multer Configuration ——
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadsPath),
  filename: (_, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// —— Admin Login ——
app.post('/admin/login', async (req, res) => {
  console.log('Admin Login API called');
  const { name, password } = req.body;
  try {
    const admin = await Admin.findOne({ name });
    if (!admin) return res.status(400).json({ message: 'Admin not found' });
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    res.status(200).json({ message: 'Login successful', role: 'admin', name: admin.name });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// —— Articles Endpoints ——
app.post('/admin/dashboard/add-article', upload.single('image'), async (req, res) => {
  const { title, category, content } = req.body;
  if (!title || !category || !content) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  try {
    const article = new Article({ title, category, content });
    if (req.file) article.image = req.file.filename;
    await article.save();
    res.status(200).json({ message: 'Article added successfully' });
  } catch (err) {
    console.error('Error adding article:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/admin/dashboard/all-articles', async (req, res) => {
  try {
    const articles = await Article.find();
    res.status(200).json({ articles });
  } catch (err) {
    console.error('Error fetching articles:', err);
    res.status(500).json({ message: 'Server error while fetching articles' });
  }
});

app.delete('/admin/dashboard/delete-article/:id', async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (article?.image) {
      fs.unlink(path.join(uploadsPath, article.image), () => {});
    }
    if (!article) return res.status(404).json({ message: 'Article not found' });
    res.status(200).json({ message: 'Article deleted successfully' });
  } catch (err) {
    console.error('Error deleting article:', err);
    res.status(500).json({ message: 'Server error deleting article' });
  }
});

app.put('/admin/dashboard/update-article/:id', upload.single('image'), async (req, res) => {
  try {
    const { title, category, content } = req.body;
    const updateData = { title, category, content };
    if (req.file) {
      updateData.image = req.file.filename;
      const old = await Article.findById(req.params.id);
      if (old?.image) fs.unlink(path.join(uploadsPath, old.image), () => {});
    }
    const updated = await Article.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) return res.status(404).json({ message: 'Article not found' });
    res.status(200).json({ message: 'Article updated successfully', article: updated });
  } catch (err) {
    console.error('Error updating article:', err);
    res.status(500).json({ message: 'Server error updating article' });
  }
});

// —— Carousel Endpoints ——
app.get('/admin/dashboard/carousel', async (req, res) => {
  try {
    const items = await Carousel.find();
    res.status(200).json({ carousel: items });
  } catch (err) {
    console.error('Error fetching carousel items:', err);
    res.status(500).json({ message: 'Error fetching carousel items' });
  }
});

app.post('/admin/dashboard/carousel', upload.single('image'), async (req, res) => {
  const { title, caption } = req.body;
  if (!title || !caption) {
    return res.status(400).json({ message: 'Title and caption are required' });
  }
  try {
    const item = new Carousel({ title, caption });
    if (req.file) item.image = req.file.filename;
    await item.save();
    res.status(200).json({ message: 'Carousel item added successfully', carousel: item });
  } catch (err) {
    console.error('Error adding carousel item:', err);
    res.status(500).json({ message: 'Server error adding carousel item' });
  }
});

app.put('/admin/dashboard/carousel/:id', upload.single('image'), async (req, res) => {
  const { title, caption } = req.body;
  const updateData = { title, caption };
  if (req.file) {
    updateData.image = req.file.filename;
    const old = await Carousel.findById(req.params.id);
    if (old?.image) fs.unlink(path.join(uploadsPath, old.image), () => {});
  }
  try {
    const updated = await Carousel.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) return res.status(404).json({ message: 'Carousel item not found' });
    res.status(200).json({ message: 'Carousel item updated successfully', carousel: updated });
  } catch (err) {
    console.error('Error updating carousel item:', err);
    res.status(500).json({ message: 'Server error updating carousel item' });
  }
});

app.delete('/admin/dashboard/carousel/:id', async (req, res) => {
  try {
    const item = await Carousel.findByIdAndDelete(req.params.id);
    if (item?.image) fs.unlink(path.join(uploadsPath, item.image), () => {});
    if (!item) return res.status(404).json({ message: 'Carousel item not found' });
    res.status(200).json({ message: 'Carousel item deleted successfully' });
  } catch (err) {
    console.error('Error deleting carousel item:', err);
    res.status(500).json({ message: 'Server error deleting carousel item' });
  }
});

app.get('/admin/dashboard/article/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: 'Article not found' });
    res.status(200).json({ article });
  } catch (err) {
    console.error('Error fetching article:', err);
    res.status(500).json({ message: 'Server error fetching article' });
  }
});

// —— Serve React Frontend in Production ——
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'the-awaz', 'build')));
  app.get('*', (_, res) => {
    res.sendFile(path.join(__dirname, '..', 'the-awaz', 'build', 'index.html'));
  });
}

// —— Start the Server only after Mongoose has connected ——
const PORT = process.env.PORT || 5002;
const mongoose = require('mongoose');
mongoose.connection.once('open', () => {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
});
