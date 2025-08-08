const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const os = require('os');

const app = express();
const PORT = 3001;

// Get the local IP address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  return 'localhost';
}

const LOCAL_IP = getLocalIP();

// Enable CORS for mobile app
app.use(cors());
app.use(express.json());

// Serve static files from music directory
app.use('/music', express.static(path.join(__dirname, 'music')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const musicDir = path.join(__dirname, 'music');
    if (!fs.existsSync(musicDir)) {
      fs.mkdirSync(musicDir, { recursive: true });
    }
    cb(null, musicDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp3|wav|m4a|flac|ogg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed!'));
    }
  }
});

// Get list of available songs
app.get('/api/songs', (req, res) => {
  try {
    const musicDir = path.join(__dirname, 'music');
    
    if (!fs.existsSync(musicDir)) {
      return res.json([]);
    }

    const files = fs.readdirSync(musicDir);
    const songs = files
      .filter(file => /\.(mp3|wav|m4a|flac|ogg)$/i.test(file))
      .map(file => {
        const stats = fs.statSync(path.join(musicDir, file));
        return {
          id: file,
          title: path.parse(file).name,
          artist: 'Local Music',
          album: 'PC Music Library',
          duration: 0, // Would need to analyze file for actual duration
          uri: `http://${LOCAL_IP}:${PORT}/music/${encodeURIComponent(file)}`,
          filename: file,
          size: stats.size,
          addedAt: stats.mtime
        };
      });

    res.json(songs);
  } catch (error) {
    console.error('Error reading music directory:', error);
    res.status(500).json({ error: 'Failed to read music directory' });
  }
});

// Upload a new song
app.post('/api/upload', upload.single('song'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    res.json({
      message: 'Song uploaded successfully',
      song: {
        id: req.file.filename,
        title: path.parse(req.file.filename).name,
        artist: 'Local Music',
        album: 'PC Music Library',
        uri: `http://${LOCAL_IP}:${PORT}/music/${encodeURIComponent(req.file.filename)}`
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Delete a song
app.delete('/api/songs/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'music', filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ message: 'Song deleted successfully' });
    } else {
      res.status(404).json({ error: 'Song not found' });
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎵 Music server running on http://localhost:${PORT}`);
  console.log(`🌐 Network accessible at http://${LOCAL_IP}:${PORT}`);
  console.log(`📁 Music directory: ${path.join(__dirname, 'music')}`);
  console.log(`📱 Mobile app should connect to: http://${LOCAL_IP}:${PORT}`);
  console.log(`\nTo find your PC's IP address:`);
  console.log(`Windows: ipconfig`);
  console.log(`Mac/Linux: ifconfig or ip addr`);
}); 