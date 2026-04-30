const { PrismaClient } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient();
  const count = await prisma.post.count({ where: { media: { none: {} } } });
  console.log('count', count);
  const rows = await prisma.post.findMany({ where: { media: { none: {} } }, take: 10, include: { author: true } });
  console.log(JSON.stringify(rows, null, 2));
  await prisma.$disconnect();
})();
