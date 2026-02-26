import { Injectable, Logger } from '@nestjs/common';
import { SourcePrismaService } from '../database/source-prisma.service';
import { TargetPrismaService } from '../database/target-prisma.service';
import { TransformRegistry } from '../transform.registry';
import { TextTransformRegistry } from './text-transform.registry';
import { RawData } from '../generated/source-client';

export interface ProcessedRecord {
  original_text: string;
  transformed_text: string;
  strategy_used: string;
}

@Injectable()
export class EtlService {
  private readonly logger = new Logger(EtlService.name);

  constructor(
    private readonly sourceDb: SourcePrismaService,
    private readonly targetDb: TargetPrismaService,
    private readonly transformRegistry: TransformRegistry,
    private readonly textTransformRegistry: TextTransformRegistry,
  ) {}

  async extractData(): Promise<RawData[]> {
    try {
      return await this.sourceDb.rawData.findMany();
    } catch (error: unknown) {
      throw new Error(`Error extracting data from source: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  processRecords(records: RawData[], strategyName: string): ProcessedRecord[] {
    const results: ProcessedRecord[] = [];

    for (const record of records) {
      try {
        const strategy = this.textTransformRegistry.getStrategy(strategyName);

        if (!strategy) {
          this.logger.warn(`Strategy "${strategyName}" not found, skipping record ${record.id}`);
          continue;
        }

        results.push({
          original_text: record.text_content,
          transformed_text: strategy.transform(record.text_content),
          strategy_used: strategyName,
        });
      } catch (error: unknown) {
        this.logger.error(`Error processing record ${record.id}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    return results;
  }

  async loadData(processedRecords: ProcessedRecord[]): Promise<{ inserted: number }> {
    try {
      const result = await this.targetDb.processedData.createMany({
        data: processedRecords,
      });
      return { inserted: result.count };
    } catch (error: unknown) {
      throw new Error(`Error loading data into target: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async runFullMigration(strategyName: string = 'normalize'): Promise<{
    status: string;
    records_processed: number;
    timestamp: string;
  }> {
    this.logger.log('Starting ETL migration...');

    this.logger.log('Phase 1/3: Extracting data from source...');
    const rawRecords = await this.extractData();
    this.logger.log(`Extracted ${rawRecords.length} records.`);

    this.logger.log(`Phase 2/3: Transforming records with strategy "${strategyName}"...`);
    const processedRecords = this.processRecords(rawRecords, strategyName);
    this.logger.log(`Transformed ${processedRecords.length} records.`);

    this.logger.log('Phase 3/3: Loading data into target (clearing previous run)...');
    await this.targetDb.processedData.deleteMany();
    const { inserted } = await this.loadData(processedRecords);
    this.logger.log(`Inserted ${inserted} records into target.`);

    this.logger.log('ETL migration completed successfully.');

    return {
      status: 'success',
      records_processed: inserted,
      timestamp: new Date().toISOString(),
    };
  }
}
