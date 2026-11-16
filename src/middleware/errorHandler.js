import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

export const notFoundHandler = (req, res, next) => {
    const err = new Error('Page Not Found');
    err.status = 404;
    next(err);
};

export const globalErrorHandler = (err, req, res, next) => {
    if (res.headersSent || res.finished) {
        return next(err);
    }

    const status = err.status || err.statusCode || 500;

    // Log the error (only print stack trace if it's a 500 in development)
    if (status >= 500) {
        logger.error({ err, status }, 'Server error occurred');
    } else {
        logger.warn({ err: err.message, status }, 'Client error occurred');
    }

    // Map status codes to templates and titles
    const errorMap = {
        400: { template: '400', title: 'Bad Request' },
        403: { template: '403', title: 'Access Denied' },
        404: { template: '404', title: 'Page Not Found' },
    };

    const { template, title } = errorMap[status] || { template: '500', title: 'Server Error' };

    const context = {
        title,
        error: env.NODE_ENV === 'production' ? 'An error occurred.' : err.message,
        stack: env.NODE_ENV === 'production' ? null : err.stack,
        user: req.session?.user || null,
        requiredRole: err.requiredRole || null,
        NODE_ENV: env.NODE_ENV
    };

    try {
        res.status(status).render(`errors/${template}`, context);
    } catch (renderErr) {
        logger.error({ renderErr }, 'Failed to render error page');
        if (!res.headersSent) {
            res.status(status).send(`<h1>Error ${status}</h1><p>${context.error}</p>`);
        }
    }
};
