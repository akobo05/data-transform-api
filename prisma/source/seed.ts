import { PrismaClient } from '../../src/generated/source-client';
import { fakerES as faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const DIAGNOSTICOS = [
  { code: 'E11',  desc: 'Diabetes mellitus tipo 2' },
  { code: 'I10',  desc: 'Hipertensión esencial' },
  { code: 'U07.1', desc: 'COVID-19' },
  { code: 'S72',  desc: 'Fractura de fémur' },
  { code: 'F32',  desc: 'Episodio depresivo' },
  { code: 'J18',  desc: 'Neumonía' },
  { code: 'K21',  desc: 'Enfermedad por reflujo gastroesofágico' },
  { code: 'N18',  desc: 'Enfermedad renal crónica' },
];

const ESTADOS = ['ACTIVO', 'EGRESADO', 'FALLECIDO'];

function formatDate(date: Date): string {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

async function main() {
  console.log('Seeding source database with medical records...');

  await prisma.paciente.deleteMany();

  const records = Array.from({ length: 60 }, (_, i) => {
    const edad = faker.number.int({ min: 18, max: 90 });
    const genero = i % 2 === 0 ? 'M' : 'F';
    const dx = DIAGNOSTICOS[i % DIAGNOSTICOS.length];
    const estado = ESTADOS[i % ESTADOS.length];

    const birthYear = 2026 - edad;
    const birthDate = new Date(birthYear, faker.number.int({ min: 0, max: 11 }), faker.number.int({ min: 1, max: 28 }));
    const regDate = new Date(2026, 1, faker.number.int({ min: 1, max: 27 }));

    const padded = (i + 1).toString().padStart(4, '0');

    return {
      pac_cod: `PAC-${padded}`,
      pac_primer_nombre: genero === 'M' ? faker.person.firstName('male').toUpperCase() : faker.person.firstName('female').toUpperCase(),
      pac_apellido: faker.person.lastName().toUpperCase(),
      pac_fec_nac: formatDate(birthDate),
      pac_genero: genero,
      pac_dx: dx.code,
      pac_dx_desc: dx.desc,
      pac_estado: estado,
      pac_edad: edad,
      fec_registro: formatDate(regDate),
    };
  });

  await prisma.paciente.createMany({ data: records });

  console.log(`Inserted ${records.length} patients into Paciente.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
