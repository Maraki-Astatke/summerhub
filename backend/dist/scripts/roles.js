import prisma from '../lib/prisma.js';
async function seedRoles() {
    console.log('🌱 Seeding roles...');
    const roles = [
        {
            name: 'student',
            description: 'Regular student - takes quizzes, joins lessons, purchases products, writes blogs'
        },
        {
            name: 'scholarship_giver',
            description: 'Scholarship Provider - creates scholarships, reviews applications, selects students, writes scholarship blogs'
        },
        {
            name: 'teacher',
            description: 'Teacher - creates lessons, teaches students, creates educational content'
        },
        {
            name: 'seller',
            description: 'Marketplace seller - lists products, manages inventory, fulfills orders'
        },
        {
            name: 'parent',
            description: 'Parent/Guardian - monitors child progress, approves purchases'
        },
        {
            name: 'admin',
            description: 'Administrator - full access to all platform features'
        }
    ];
    for (const role of roles) {
        await prisma.role.upsert({
            where: { name: role.name },
            update: {},
            create: role
        });
    }
    console.log('✅ Roles seeded successfully!');
    const allRoles = await prisma.role.findMany();
    console.table(allRoles);
    await prisma.$disconnect();
}
seedRoles().catch(console.error);
