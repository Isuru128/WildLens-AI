const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.use(
    '/uploads',
    express.static(path.join(__dirname, '../uploads'))
);

app.get('/', (req, res) => {
    res.json({
        msg: 'Backend is running'
    });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

module.exports = app;
