const express = require('express');
const mongoose = require('mongoose');
const config = require('config');

//bring all routes
const auth = require("./routes/api/auth");
const profile = require("./routes/api/profile");
const questions = require("./routes/api/questions");

const app = express();

//BodyParser Middleware
app.use(express.json());

//DB Config
const db = config.get('mongoURI');

//Connect to mongoDb
mongoose.connect(db, { useNewUrlParser: true, useCreateIndex: true , useUnifiedTopology: true})
    .then(() => console.log('MongoDB connected!!'))
    .catch(err => console.log(err));

//just for testing 
app.get('/', (req,res) => {
    res.send("hey there Big stack");
});

//actual routes
app.use('/api/auth',auth);
app.use('/api/profile',profile);
app.use('/api/questions',questions);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server is running at ${port}`));