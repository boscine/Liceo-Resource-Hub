import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '@prisma/client';

// Prisma v7 requires a driver adapter for MySQL/MariaDB
// Parse DATABASE_URL: mysql://user:password@host:port/database
const url = new URL(process.env.DATABASE_URL!);

const adapter = new PrismaMariaDb({
  host: url.hostname,
  port: Number(url.port) || 3306,
  user: url.username,
  password: url.password,
  database: url.pathname.replace('/', ''),
});

const prisma = new PrismaClient({ adapter });

export default prisma;
