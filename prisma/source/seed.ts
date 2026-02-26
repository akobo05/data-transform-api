import { PrismaClient } from '../../src/generated/source-client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

function toLowerCaseText(): string {
  return faker.lorem.sentence().toLowerCase();
}

function toUpperCaseText(): string {
  return faker.lorem.sentence().toUpperCase();
}

function toMixedCaseText(): string {
  return faker.lorem
    .sentence()
    .split('')
    .map((char, i) => (i % 2 === 0 ? char.toUpperCase() : char.toLowerCase()))
    .join('');
}

function withExtraSpaces(): string {
  const words = faker.lorem.words({ min: 4, max: 8 }).split(' ');
  return words.map(w => `  ${w}  `).join('   ');
}

async function main() {
  console.log('Seeding source database...');

  await prisma.rawData.deleteMany();

  const generators = [toLowerCaseText, toUpperCaseText, toMixedCaseText, withExtraSpaces];

  const records = Array.from({ length: 56 }, (_, i) => ({
    text_content: generators[i % generators.length](),
  }));

  await prisma.rawData.createMany({ data: records });

  console.log(`Inserted ${records.length} records into RawData.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
