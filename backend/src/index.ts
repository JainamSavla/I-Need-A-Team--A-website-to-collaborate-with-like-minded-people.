import app from './app.ts';
import prisma from './client.ts';
import { serve } from '@hono/node-server';
import dotenv from 'dotenv';

let server: any;

dotenv.config();

console.log('Starting');
async function main() {
    try {
        await prisma.$connect();
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Failed to connect to the database:', error);
        // Don't exit process, let it try to handle requests (which will fail if DB is still down)
        // This prevents the preview from failing immediately if DB is not ready
    }

    server = serve({
        fetch: app.fetch,
        port: (process.env.PORT || 3000) as number
    });

    const exitHandler = () => {
        if (server) {
            server.close(() => {
                process.exit(1);
            });
        } else {
            process.exit(1);
        }
    };

    const unexpectedErrorHandler = () => {
        exitHandler();
    };

    process.on('uncaughtException', unexpectedErrorHandler);
    process.on('unhandledRejection', unexpectedErrorHandler);

    process.on('SIGTERM', () => {
        if (server) {
            server.close();
        }
    });
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();
