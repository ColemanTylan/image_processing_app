// Imports modules
const express = require('express');
const multer = require('multer'); // Middleware for handling multipart/form-data
const { uploadImage, processImage } = require('./controllers/imageController');

// Creates the Express application
const app = express();

// Multer configuration for handling file uploads
const upload = multer({ dest: 'uploads/' });

// Defines routes
app.post('/upload', upload.single('image'), uploadImage);
app.post('/process', processImage);

// Starts server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});