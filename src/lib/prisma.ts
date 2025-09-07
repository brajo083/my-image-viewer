import { PrismaClient } from '@prisma/client';

// Declare a global variable to hold the Prisma Client instance.
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Create a single, shared instance of the Prisma Client.
// If a global instance already exists, use it; otherwise, create a new one.
const prisma = global.prisma || new PrismaClient();

// In development, assign the created instance to the global variable.
// This prevents creating a new instance on every hot-reload.
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;

