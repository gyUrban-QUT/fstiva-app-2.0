const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const adminEventsNotificationPatternRoutes = require("./routes/adminEventsNotificationPatterns.routes");
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/userevents', require('./routes/userEventRoutes'));
app.use("/api", adminEventsNotificationPatternRoutes);

// Export the app object for testing
if (require.main === module) {
    connectDB();
    // If the file is run directly, start the server
    const PORT = process.env.PORT || 5001;
    // 1. Tell your backend where your frontend build files live
    app.use(express.static(path.join(__dirname, '../frontend/build')));

    // 2. Serve the index.html for any layout or page requests
    app.get('*splat', (req, res) => {
      res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
    });

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  }


module.exports = app;
