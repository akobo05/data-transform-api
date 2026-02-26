import { Injectable } from '@nestjs/common';
import { SourcePrismaService } from '../database/source-prisma.service';
import { TargetPrismaService } from '../database/target-prisma.service';
import { RawData } from '../generated/source-client';

export interface ProcessedRecord {
  original_text: string;
  transformed_text: string;
  strategy_used: string;
}

@Injectable()
export class EtlService {
  constructor(
    private readonly sourceDb: SourcePrismaService,
    private readonly targetDb: TargetPrismaService,
  ) {}

  async extractData(): Promise<RawData[]> {
    try {
      return await this.sourceDb.rawData.findMany();
    } catch (error) {
      throw new Error(`Error extracting data from source: ${error.message}`);
    }
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
