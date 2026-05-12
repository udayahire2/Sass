const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('node:path');

const { env } = require('./config/env');
const { errorHandler, notFound } = require('./middlewares/errorHandler');

const app = express();

// Middleware
app.disable('x-powered-by');
app.use(express.json({ limit: env.requestJsonLimit }));
app.use(express.urlencoded({ extended: true, limit: env.requestFormLimit }));
app.use(cors({
    origin(origin, callback) {
        if (!origin || env.corsOrigins.includes(origin)) {
            callback(null, true);
            return;
        }

        callback(null, false);
    },
    credentials: true,
}));

// Static avatar files — must be BEFORE helmet so CORP header can be set to cross-origin
// Helmet defaults to same-origin which blocks <img src="http://localhost:5001/..."> from localhost:5173
app.use('/uploads/avatars', (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
}, express.static(path.join(__dirname, '../uploads/avatars')));

// Static resource files — cross-origin for frontend access
app.use('/uploads/resources', (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
}, express.static(path.join(__dirname, '../uploads/resources')));

// Static syllabus files — cross-origin for frontend access
app.use('/uploads/syllabus', (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
}, express.static(path.join(__dirname, '../uploads/syllabus')));

app.use(helmet());

if (env.nodeEnv === 'development') {
    app.use(morgan('dev'));
}

// Routes
app.use('/api/v1', require('./routes'));

// Error Handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
