const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create a sample decision
  const decision = await prisma.decision.create({
    data: {
      title: 'Implement User Authentication',
      description: 'Deciding on the authentication system for our application',
      context: 'We need a secure way to authenticate users in our application',
      reasoning: 'JWT is widely used, stateless, and works well with our tech stack',
      assumptions: [
        'JWT is secure enough for our use case',
        'Our team is familiar with JWT implementation',
        'We can handle token refresh properly'
      ],
      expectedOutcome: 'A secure authentication system that supports user login, registration, and token management',
      status: 'COMPLETED',
      outcome: {
        create: {
          actualOutcome: 'Successfully implemented JWT authentication with refresh tokens',
          reflectionNotes: 'The implementation went smoothly, but we should add rate limiting to prevent brute force attacks.'
        }
      }
    },
    include: {
      outcome: true
    }
  });

  console.log('Sample decision created:', decision);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
