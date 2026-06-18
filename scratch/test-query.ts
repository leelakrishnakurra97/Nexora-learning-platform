import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Running users fetch query...');
    const users = await prisma.user.findMany({
      include: {
        studentProfile: {
          include: {
            class: true,
            board: true,
            subscriptions: {
              include: {
                payments: true
              },
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        },
        teacherProfile: true,
        adminProfile: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    console.log('Success! Fetched', users.length, 'users.');
  } catch (err: any) {
    console.error('Query failed with error:');
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
