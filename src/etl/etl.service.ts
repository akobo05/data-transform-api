import { Injectable, Logger } from '@nestjs/common';
import { SourcePrismaService } from '../database/source-prisma.service';
import { TargetPrismaService } from '../database/target-prisma.service';
import { TransformRegistry } from '../transform.registry';
import { TransformationRule, PrimitiveValue } from '../strategies/transform.interface';
import { Paciente } from '../generated/source-client';

const MIGRATION_RULES: TransformationRule[] = [
  { type: 'direct', source: 'pac_cod',           target: 'person_source_value' },
  { type: 'direct', source: 'pac_primer_nombre', target: 'given_name' },
  { type: 'direct', source: 'pac_apellido',       target: 'family_name' },
  { type: 'direct', source: 'pac_fec_nac',        target: 'birth_date' },
  { type: 'lookup', source: 'pac_genero',         target: 'gender',        map: { M: 'Male', F: 'Female' } },
  { type: 'direct', source: 'pac_dx',             target: 'condition_code' },
  { type: 'direct', source: 'pac_dx_desc',        target: 'condition_description' },
  { type: 'lookup', source: 'pac_estado',         target: 'visit_status',  map: { ACTIVO: 'active', EGRESADO: 'discharged', FALLECIDO: 'deceased' } },
  { type: 'direct', source: 'pac_edad',           target: 'age_at_visit' },
];

@Injectable()
export class EtlService {
  private readonly logger = new Logger(EtlService.name);

  constructor(
    private readonly sourceDb: SourcePrismaService,
    private readonly targetDb: TargetPrismaService,
    private readonly transformRegistry: TransformRegistry,
  ) {}

  async extractData(): Promise<Paciente[]> {
    try {
      return await this.sourceDb.paciente.findMany();
    } catch (error: unknown) {
      throw new Error(`Error extracting data from source: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  mapRecord(record: Record<string, unknown>, rules: TransformationRule[]): Record<string, PrimitiveValue> {
    const result: Record<string, PrimitiveValue> = {};
    for (const rule of rules) {
      const strategy = this.transformRegistry.getStrategy(rule.type);
      const value = strategy.apply(rule, record);
      if (value !== undefined) {
        result[rule.target] = value;
      }
    }
    return result;
  }

  async loadData(mappedRecords: Record<string, PrimitiveValue>[]): Promise<{ inserted: number }> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await this.targetDb.clinicalRecord.createMany({
        data: mappedRecords as any,
      });
      return { inserted: result.count };
    } catch (error: unknown) {
      throw new Error(`Error loading data into target: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async runFullMigration(): Promise<{
    status: string;
    records_processed: number;
    timestamp: string;
  }> {
    this.logger.log('Starting ETL migration...');

    this.logger.log('Phase 1/3: Extracting data from source...');
    const rawRecords = await this.extractData();
    this.logger.log(`Extracted ${rawRecords.length} records.`);

    this.logger.log('Phase 2/3: Mapping records with MIGRATION_RULES...');
    const mappedRecords = rawRecords.map(record =>
      this.mapRecord(record as unknown as Record<string, unknown>, MIGRATION_RULES),
    );
    this.logger.log(`Mapped ${mappedRecords.length} records.`);

    this.logger.log('Phase 3/3: Loading data into target (clearing previous run)...');
    await this.targetDb.clinicalRecord.deleteMany();
    const { inserted } = await this.loadData(mappedRecords);
    this.logger.log(`Inserted ${inserted} records into target.`);

    this.logger.log('ETL migration completed successfully.');

    return {
      status: 'success',
      records_processed: inserted,
      timestamp: new Date().toISOString(),
    };
  }
}
