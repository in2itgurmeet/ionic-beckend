const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const orderRoutes = require('./order.routes');
router.use('/auth', authRoutes);
router.use('/order', orderRoutes);

module.exports = router;
