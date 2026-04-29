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
app.use(helmet());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

if (env.nodeEnv === 'development') {
    app.use(morgan('dev'));
}

// Routes
app.use('/api/v1', require('./routes'));

// Error Handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
