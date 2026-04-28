const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const commonRoutes = require('./routes/commonRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.resolve(process.env.UPLOAD_DIR || 'src/uploads')));

app.get('/health', (_, res) => {
  res.json({ status: 'ok', message: 'API is healthy' });
});

app.use('/api/auth', authRoutes);
app.use('/api', commonRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
