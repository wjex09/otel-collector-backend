// src/routes/metrics.js
const express = require('express');
const router = express.Router();
const client = require('../config/database');

// Helper function to get timestamp for time range
const getTimeRangeTimestamp = (timeRange) => {
    const hours = parseInt(timeRange.replace('h', ''));
    const timestamp = new Date();
    timestamp.setHours(timestamp.getHours() - hours);
    return timestamp.toISOString().slice(0, 19).replace('T', ' ');
};

// Get metric data
router.get('/:metricName/data', async (req, res) => {
    const { metricName } = req.params;
    const {
        aggregation = 'AVG',
        timeRange
    } = req.query;

    try {
        let query = `SELECT * FROM otel.metrics_hourly_table WHERE metric_name = '${metricName}'`;

        if (timeRange) {
            const formattedTime = getTimeRangeTimestamp(timeRange);
            query = `SELECT * FROM otel.metrics_hourly_table WHERE metric_name = '${metricName}' AND timestamp_hour >= '${formattedTime}'`;
        }

        console.log('Executing query:', query);

        const result = await client.query({
            query
        });

        const data = await result.json();

        const transformedData = data.data
            .map(point => ({
                timestamp: point.timestamp_hour,
                value: aggregation === 'MAX' ? point.max_value :
                       aggregation === 'P90' ? point.p90_value :
                       point.avg_value
            }))
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.json(transformedData);
    } catch (error) {
        console.error('Error fetching metric data:', error);
        res.status(500).json({
            error: 'Failed to fetch metric data',
            details: error.message
        });
    }
});

// Get metric summary
router.get('/:metricName/summary', async (req, res) => {
    const { metricName } = req.params;
    const { timeRange = '24h' } = req.query;

    try {
        let query = `
            SELECT
                min(avg_value) as min_value,
                max(max_value) as max_value,
                avg(avg_value) as mean_value,
                count(*) as sample_count
            FROM otel.metrics_hourly_table
            WHERE metric_name = '${metricName}'`;

        if (timeRange) {
            const formattedTime = getTimeRangeTimestamp(timeRange);
            query += ` AND timestamp_hour >= '${formattedTime}'`;
        }

        console.log('Executing summary query:', query);

        const result = await client.query({
            query
        });

        const data = await result.json();
        res.json(data.data[0]);
    } catch (error) {
        console.error('Error fetching summary:', error);
        res.status(500).json({
            error: 'Failed to fetch summary',
            details: error.message
        });
    }
});

// Get available label keys for a metric
router.get('/:metricName/labels', async (req, res) => {
    const { metricName } = req.params;

    try {
        const query = `SELECT DISTINCT arrayJoin(mapKeys(labels)) as label_key FROM otel.metrics WHERE metric_name = '${metricName}'`;
        const result = await client.query({
            query
        });

        const data = await result.json();
        res.json(data.data.map(item => item.label_key));
    } catch (error) {
        console.error('Error fetching labels:', error);
        res.status(500).json({
            error: 'Failed to fetch labels',
            details: error.message
        });
    }
});

module.exports = router;
