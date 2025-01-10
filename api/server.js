const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

// Set up the storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const fileExtension = path.extname(file.originalname);
        cb(null, Date.now() + fileExtension);
    }
});

const upload = multer({ storage });

// Make the 'uploads' directory static so users can access uploaded files
app.use('/uploads', express.static('uploads'));

// Serve the static HTML files
app.use(express.static('public'));

// Upload endpoint to handle the file upload
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({
        message: 'File uploaded successfully!',
        url: fileUrl
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
