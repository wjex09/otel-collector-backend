# Metrics API Documentation

This API provides access to OpenTelemetry metrics stored in ClickHouse. It allows you to query metric data with various time ranges and aggregations, get metric summaries, and fetch available labels.

## Base URL
```
http://localhost:3000/api
```

## Endpoints

### 1. Get Metric Data
Fetch metric values with optional time range and aggregation.

```bash
GET /metrics/:metricName/data
```

#### Parameters
- `metricName` (path parameter): Name of the metric to fetch
- `timeRange` (query parameter): Time range in hours (e.g., '24h', '1h')
- `aggregation` (query parameter): Type of aggregation ('AVG', 'MAX', 'P90')

#### Examples
```bash
# Get default metrics (average values for all time)
curl "http://localhost:3000/api/metrics/cpu.usage/data"

# Get last 24 hours of data with average values
curl "http://localhost:3000/api/metrics/cpu.usage/data?timeRange=24h"

# Get maximum values for the last hour
curl "http://localhost:3000/api/metrics/cpu.usage/data?timeRange=1h&aggregation=MAX"

# Get 90th percentile values for the last 24 hours
curl "http://localhost:3000/api/metrics/cpu.usage/data?timeRange=24h&aggregation=P90"
```

#### Response Format
```json
[
  {
    "timestamp": "2024-11-03 10:00:00",
    "value": 58.12
  },
  {
    "timestamp": "2024-11-02 23:00:00",
    "value": 48.7
  }
]
```

### 2. Get Metric Summary
Get summary statistics for a metric over a specified time range.

```bash
GET /metrics/:metricName/summary
```

#### Parameters
- `metricName` (path parameter): Name of the metric
- `timeRange` (query parameter): Time range in hours (e.g., '24h', '1h')

#### Examples
```bash
# Get summary for last 24 hours
curl "http://localhost:3000/api/metrics/cpu.usage/summary?timeRange=24h"

# Get summary for last hour
curl "http://localhost:3000/api/metrics/cpu.usage/summary?timeRange=1h"
```

#### Response Format
```json
{
  "min_value": 48.7,
  "max_value": 236.7,
  "mean_value": 114.47,
  "sample_count": 4
}
```

### 3. Get Metric Labels
Get available label keys for a metric.

``ash
GET /metrics/:metricName/labels
```

#### Parameters
- `metricName` (path parameter): Name of the metric

#### Example
```bash
curl "http://localhost:3000/api/metrics/cpu.usage/labels"
```

#### Response Format
```json
[
  "container",
  "env"
]
```

## Error Handling
All endpoints return errors in the following format:
```json
{
  "error": "Failed to fetch metric data",
  "details": "Error message details"
}
```

## Time Range Format
Time ranges should be specified in hours with the 'h' suffix:
- `1h`: Last hour
- `24h`: Last 24 hours
- `48h`: Last 48 hours

## Aggregation Types
Available aggregation types:
- `AVG` (default): Average value
- `MAX`: Maximum value
- `P90`: 90th percentile value

## Database Schema
The API uses the following ClickHouse table structure:
```sql
CREATE TABLE otel.metrics_hourly_table (
    timestamp_hour DateTime,
    metric_name LowCardinality(String),
    service_name LowCardinality(String),
    avg_value Float64,
    max_value Float64,
    p90_value Float64
)
```

## Local Development
1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

The server will start on port 3000 by default.

## Environment Variables
- `PORT`: Server port (default: 3000)
- `CLICKHOUSE_HOST`: ClickHouse server host
- `CLICKHOUSE_USER`: ClickHouse username
- `CLICKHOUSE_PASSWORD`: ClickHouse password
- `CLICKHOUSE_DATABASE`: ClickHouse database name
