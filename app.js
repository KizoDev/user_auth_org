const express = require('express');
//const bodyParser = require('body-parser');
const db = require('./models');
const routes = require('./routes/authRoute');
const app = express();

require('dotenv').config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = 8000

// Middleware
//app.use(bodyParser.json());

// Routes
app.use("/api", routes);
//routes.initialize(app);

// Sync database and start server
db.sequelize.sync().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}).catch(err => {
  console.error('Failed to sync database:', err);
});

module.exports = app;
