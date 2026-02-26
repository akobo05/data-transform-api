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
    } catch (error) {
      throw new Error(`Error extracting data from source: ${error.message}`);
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
      } catch (error) {
        this.logger.error(`Error processing record ${record.id}: ${error.message}`);
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
    } catch (error) {
      throw new Error(`Error loading data into target: ${error.message}`);
    }
  }
}
