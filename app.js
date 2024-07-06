const express = require('express');
//const bodyParser = require('body-parser');
const db = require('./models');
const authRoute = require('./routes/authRoute');
const userRoutes = require('./routes/userRoutes');
const app = express();

require('dotenv').config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = 8000


// Routes
app.use("/auth", authRoute);
app.use("/api", userRoutes);

// Sync database and start server
db.sequelize.sync().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}).catch(err => {
  console.error('Failed to sync database:', err);
});

module.exports = app;
