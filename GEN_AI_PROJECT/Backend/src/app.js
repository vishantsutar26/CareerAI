const express = require('express');
const cookieParer = require('cookie-parser');
const cors = require('cors');
const app = express();


app.use(express.json());
app.use(cookieParer());
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}));

/* require all the routes here */
const authRouter = require('./routes/auth.routes');
const interviewRouter = require('./routes/interview.routes');
const resumeRouter = require('./routes/resume.routes');

/* using all the routes here */
app.use('/api/auth',authRouter);
app.use('/api/interview',interviewRouter);
app.use('/api/resume',resumeRouter);

/* global error handler - safety net for any error not already caught in a controller */
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Something went wrong on the server'
    });
});

module.exports = app;
