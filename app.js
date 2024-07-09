const express = require('express');
const cors = require('cors');
const db = require('./models');
const authRoute = require('./routes/authRoute');
const userRoutes = require('./routes/userRoutes');
const orgRoutes = require('./routes/orgRoutes');

const app = express();

require('dotenv').config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 3000

app.use(cors());
// Routes
app.use("/auth", authRoute);
app.use("/api", userRoutes);
app.use("/api", orgRoutes);


// Sync database and start server
db.sequelize.sync().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}).catch(err => {
  console.error('Failed to sync database:', err);
});

module.exports = app;
