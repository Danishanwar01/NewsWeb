require("./db/conn");
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Admin = require('./models/Admin');
const Article = require('./models/Article');
const Carousel = require('./models/Carousel');

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Define the uploads folder path (one level up from the current folder)
const uploadsPath = path.join(__dirname, './uploads');


if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}


app.use('/uploads', express.static(uploadsPath));

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// --------------------
// ADMIN LOGIN
// --------------------
app.post("/admin/login", async (req, res) => {
  console.log("Admin Login API called");
  const { name, password } = req.body;

  try {
    const admin = await Admin.findOne({ name });
    console.log("Admin found:", admin);

    if (!admin) {
      return res.status(400).json({ message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    console.log("Passwords match:", isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.status(200).json({ message: "Login successful", role: "admin", name: admin.name });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// --------------------
// POST ARTICLE
// --------------------
app.post('/admin/dashboard/add-article', upload.single('image'), async (req, res) => {
  try {
    const { title, category, content } = req.body;

    if (!title || !category || !content) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newArticle = new Article({ title, category, content });
    // If an image file was uploaded, save its filename in the article document.
    if (req.file) {
      newArticle.image = req.file.filename;
    }
    await newArticle.save();

    res.status(200).json({ message: 'Article added successfully' });
  } catch (err) {
    console.error('Error adding article:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// --------------------
// GET ALL ARTICLES
// --------------------
app.get('/admin/dashboard/all-articles', async (req, res) => {
  console.log("GET /admin/dashboard/all-articles called");
  try {
    const articles = await Article.find();
    console.log("Articles fetched:", articles);
    res.status(200).json({ articles });
  } catch (err) {
    console.error('Error fetching articles:', err);
    res.status(500).json({ message: 'Server error while fetching articles' });
  }
});

// --------------------
// DELETE ARTICLE
// --------------------
app.delete('/admin/dashboard/delete-article/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const article = await Article.findByIdAndDelete(id);
    if (article && article.image) {
      // Optionally remove the image file from uploads
      fs.unlink(path.join(uploadsPath, article.image), (err) => {
        if (err) {
          console.error("Error deleting image file:", err);
        }
      });
    }
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }
    res.status(200).json({ message: "Article deleted successfully" });
  } catch (err) {
    console.error('Error deleting article:', err);
    res.status(500).json({ message: "Server error deleting article" });
  }
});

// --------------------
// UPDATE ARTICLE
// --------------------
app.put('/admin/dashboard/update-article/:id', upload.single('image'), async (req, res) => {
  try {
    const id = req.params.id;
    const { title, category, content } = req.body;
    let updateData = { title, category, content };

    if (req.file) {
      updateData.image = req.file.filename;
      // Optionally remove the old image file
      const article = await Article.findById(id);
      if (article && article.image) {
        fs.unlink(path.join(uploadsPath, article.image), (err) => {
          if (err) {
            console.error("Error deleting old image file:", err);
          }
        });
      }
    }
    const updatedArticle = await Article.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedArticle) {
      return res.status(404).json({ message: "Article not found" });
    }
    res.status(200).json({ message: "Article updated successfully", article: updatedArticle });
  } catch (err) {
    console.error('Error updating article:', err);
    res.status(500).json({ message: "Server error updating article" });
  }
});

// --------------------
// CAROUSEL ENDPOINTS
// --------------------

// Get all carousel items
app.get('/admin/dashboard/carousel', async (req, res) => {
  try {
    const carouselItems = await Carousel.find();
    res.status(200).json({ carousel: carouselItems });
  } catch (err) {
    console.error('Error fetching carousel items:', err);
    res.status(500).json({ message: 'Error fetching carousel items' });
  }
});

// --------------------
// Add a new carousel item
// --------------------
app.post('/admin/dashboard/carousel', upload.single('image'), async (req, res) => {
  try {
    const { title, caption } = req.body;
    if (!title || !caption) {
      return res.status(400).json({ message: 'Title and caption are required' });
    }
    const newCarousel = new Carousel({ title, caption });
    if (req.file) {
      newCarousel.image = req.file.filename;
    }
    await newCarousel.save();
    res.status(200).json({ message: 'Carousel item added successfully', carousel: newCarousel });
  } catch (err) {
    console.error('Error adding carousel item:', err);
    res.status(500).json({ message: 'Server error adding carousel item' });
  }
});

// --------------------
// Update a carousel item by ID
// --------------------
app.put('/admin/dashboard/carousel/:id', upload.single('image'), async (req, res) => {
  try {
    const { title, caption } = req.body;
    let updateData = { title, caption };

    if (req.file) {
      updateData.image = req.file.filename;
      // Optionally, delete the old image file:
      const carouselItem = await Carousel.findById(req.params.id);
      if (carouselItem && carouselItem.image) {
        fs.unlink(path.join(uploadsPath, carouselItem.image), (err) => {
          if (err) console.error('Error deleting old carousel image:', err);
        });
      }
    }
    const updatedCarousel = await Carousel.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedCarousel) {
      return res.status(404).json({ message: 'Carousel item not found' });
    }
    res.status(200).json({ message: 'Carousel item updated successfully', carousel: updatedCarousel });
  } catch (err) {
    console.error('Error updating carousel item:', err);
    res.status(500).json({ message: 'Server error updating carousel item' });
  }
});

// --------------------
// Delete a carousel item by ID
// --------------------
app.delete('/admin/dashboard/carousel/:id', async (req, res) => {
  try {
    const carouselItem = await Carousel.findByIdAndDelete(req.params.id);
    if (carouselItem && carouselItem.image) {
      fs.unlink(path.join(uploadsPath, carouselItem.image), (err) => {
        if (err) console.error('Error deleting carousel image:', err);
      });
    }
    if (!carouselItem) {
      return res.status(404).json({ message: 'Carousel item not found' });
    }
    res.status(200).json({ message: 'Carousel item deleted successfully' });
  } catch (err) {
    console.error('Error deleting carousel item:', err);
    res.status(500).json({ message: 'Server error deleting carousel item' });
  }
});

// --------------------
// GET a single article by ID
// --------------------
app.get('/admin/dashboard/article/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    res.status(200).json({ article });
  } catch (err) {
    console.error('Error fetching article:', err);
    res.status(500).json({ message: 'Server error fetching article' });
  }
});

// --------------------
// Serve React App in Production
// --------------------
if (process.env.NODE_ENV === 'production') {

  app.use(express.static(path.join(__dirname, '..', 'the-awaz', 'build')));
  
  // For any route not handled by our APIs
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'the-awaz', 'build', 'index.html'));
  });
}

// Set the port dynamically from environment or default to 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
