import { Queue } from 'bullmq';
import { IngestionResponse } from '../../shared';
import { Subject } from 'rxjs';
export interface StreamEvent {
    orgId: string;
    type: 'raw_event' | 'telemetry_log';
    data: any;
}
export declare class IngestionService {
    private readonly queue;
    static readonly stream$: Subject<StreamEvent>;
    constructor(queue: Queue);
    enqueuePayload(orgId: string, rawPayload: unknown): Promise<IngestionResponse>;
}
