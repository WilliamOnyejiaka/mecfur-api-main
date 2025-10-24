// src/lib/prometheus.ts
import { Registry, collectDefaultMetrics, Counter, Histogram, Gauge } from 'prom-client';
import type { Request, Response, NextFunction } from 'express';

// Create a dedicated registry (so you can reuse multiple if needed)
const register = new Registry();

// Collect default Node / process metrics (cpu, heap, eventloop, etc)
collectDefaultMetrics({
    register,
    // optional: prefix: 'myapp_'
});

// Custom metrics
const httpRequestsTotal = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'statusCode', 'service'] as const,
    registers: [register],
});

const httpRequestDurationSeconds = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'statusCode', 'service'] as const,
    // buckets chosen for web request latencies: 5ms..10s
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    registers: [register],
});

const inFlightRequests = new Gauge({
    name: 'http_in_flight_requests',
    help: 'Number of in-flight HTTP requests',
    labelNames: ['service'] as const,
    registers: [register],
});

// Optional: record number of errors
const httpRequestErrors = new Counter({
    name: 'http_request_errors_total',
    help: 'Total number of failed HTTP requests',
    labelNames: ['method', 'route', 'service'] as const,
    registers: [register],
});

const SERVICE_NAME = process.env.SERVICE_NAME ?? 'my-express-service';

export { register, httpRequestsTotal, httpRequestDurationSeconds, inFlightRequests, httpRequestErrors, SERVICE_NAME };

// Express middleware to instrument requests
export function metricsMiddleware() {
    return function (req: Request, res: Response, next: NextFunction) {
        const route = (req.route && req.route.path) || req.path || 'unknown';
        const labelsBase = { method: req.method, route, service: SERVICE_NAME };

        inFlightRequests.labels(SERVICE_NAME).inc();
        const end = httpRequestDurationSeconds.startTimer();

        res.on('finish', () => {
            const statusCode = String(res.statusCode);
            httpRequestsTotal.labels(req.method, route, statusCode, SERVICE_NAME).inc();
            end({ method: req.method, route, statusCode, service: SERVICE_NAME });
            if (res.statusCode >= 500) {
                httpRequestErrors.labels(req.method, route, SERVICE_NAME).inc();
            }
            inFlightRequests.labels(SERVICE_NAME).dec();
        });

        // in case of abrupt close
        res.on('close', () => {
            inFlightRequests.labels(SERVICE_NAME).dec();
        });

        next();
    };
}
