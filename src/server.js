// src/sever.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const client = require('./config/database');
const metricsRoutes = require('./routes/metrics');

const app = express();

app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/health', async (req, res) => {
    try {
        const result = await client.query({
            query: 'SELECT 1 as status',
            format: 'JSONEachRow'
        });
        const data = await result.json();
        res.json({ status: 'ok', clickhouse: data });
    } catch (error) {
        console.error('Health check error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Routes
app.use('/api/metrics', metricsRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Metrics API server running on port ${port}`);
});

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
});
