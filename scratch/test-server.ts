import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'eduverse-dev-secret';

async function main() {
  try {
    // Find the admin user
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!adminUser) {
      console.error('No admin user found in database!');
      return;
    }

    console.log('Found admin:', adminUser.email, adminUser.id);

    // Sign token
    const token = jwt.sign({ userId: adminUser.id, role: 'ADMIN' }, JWT_SECRET, { expiresIn: '7d' });
    console.log('Signed token:', token);

    // Call /api/auth/users
    console.log('Sending request to http://localhost:3000/api/auth/users...');
    const res = await fetch('http://localhost:3000/api/auth/users', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('Response status:', res.status);
    const text = await res.text();
    console.log('Response body:', text);
  } catch (err) {
    console.error('Fetch check failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
