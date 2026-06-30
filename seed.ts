import { prisma } from './lib/prisma'

async function main() {
  await prisma.user.upsert({
    where: { id: '00000000-0000-0000-0000-000000000000' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000000',
      email: 'test@nexuslearn.ai',
      rawUserMetaData: { full_name: 'Test User' },
    },
  })
  console.log('Dummy user successfully seeded')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
