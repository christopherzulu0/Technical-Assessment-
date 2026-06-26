import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

try {
  console.log('Testing database connection...');
  const forms = await db.form.findMany();
  console.log('Success! Forms:', forms);
} catch (error) {
  console.error('Error:', error.message);
  console.error('Full error:', error);
} finally {
  await db.$disconnect();
}
