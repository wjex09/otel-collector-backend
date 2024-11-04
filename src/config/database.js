// src/cofig/database.js

const { createClient } = require('@clickhouse/client');

const client = createClient({
    host: 'https://t3v0qmphlz.ap-south-1.aws.clickhouse.cloud:8443',
    username: 'default',
    password: 'CSgSGq25q4Re.',
    database: 'otel',
    debug: true
});



console.log('Client query method:', client.query.toString());
console.log('Client methods:', Object.keys(client));

// Test the connection
async function testConnection() {
    try {
        const result = await client.query({
            query: 'SELECT 1',
            format: 'JSONEachRow'
        });
        const data = await result.json();
        console.log('ClickHouse connection successful:', data);
    } catch (error) {
        console.error('ClickHouse connection error:', error);
        throw error;
    }
}



testConnection();

module.exports = client;



