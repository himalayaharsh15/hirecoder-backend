// ------------------------------------------------------------
// Prisma Configuration
// ------------------------------------------------------------
// This file tells Prisma where to find:
//
// 1. Prisma schema
// 2. Migration folder
// 3. Database connection
//
// We load DATABASE_URL from the .env file using dotenv.
// ------------------------------------------------------------

import 'dotenv/config';

import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
});
