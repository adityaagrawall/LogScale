import { IngestionService } from './ingestion.service';
export declare class IngestionController {
    private readonly ingestionService;
    constructor(ingestionService: IngestionService);
    ingest(req: any, payload: any): Promise<import("../../shared").IngestionResponse>;
}
