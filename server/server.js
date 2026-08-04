const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/student", require("./routes/student"));

app.use("/api/drives", require("./routes/drives"));
app.use("/api/applications", require("./routes/applications"));

app.use("/api/admin", require("./routes/admin"));


app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get('/', (req, res) => res.send('API running'));

app.use("/api/coordinator", require("./routes/coordinator"));

app.listen(5000, () => console.log('Server on port 5000'));