require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDB = require('./config/db');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

const uploadsDirectory = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadsDirectory, { recursive: true });
app.use('/uploads', express.static(uploadsDirectory));

connectDB(process.env.MONGO_URI || 'mongodb://localhost:27017/ai_solutions_db');

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(cookieParser());
// Allow localhost on any port for development
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      callback(null, true);
    } else {
      callback(new Error('CORS error'));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/demos', require('./routes/demos'));
app.use('/api/events', require('./routes/events'));
app.use('/api/event-items', require('./routes/eventItems'));
app.use('/api/articles', require('./routes/articles'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/gallery', require('./routes/gallery'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/admin', require('./routes/admin'));

app.get('/', (req, res) => res.json({ message: 'AI-Solutions API' }));

// Start server with EADDRINUSE handling: try next ports up to a limit
function startServer(port, attemptsLeft = 10) {
  port = parseInt(port, 10) || 5000;
  const server = app.listen(port);
  server.on('listening', () => {
    console.log(`Server running on port ${port}`);
  });
  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE' && attemptsLeft > 0) {
      const nextPort = port + 1;
      console.warn(`Port ${port} in use, trying port ${nextPort} (${attemptsLeft - 1} attempts left)`);
      // Give a short delay before retrying to avoid tight loop
      setTimeout(() => startServer(nextPort, attemptsLeft - 1), 200);
    } else {
      console.error('Failed to start server:', err);
      process.exit(1);
    }
  });
}

startServer(PORT, 10);
