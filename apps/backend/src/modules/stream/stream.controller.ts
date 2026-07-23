import { Controller, Sse, MessageEvent, Query, UseGuards, Req } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { IngestionService, StreamEvent } from '../ingestion/ingestion.service';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';

@Controller('api/v1/stream')
export class StreamController {
  @Sse('live')
  @UseGuards(ApiKeyGuard)
  streamLiveEvents(@Req() req: any): Observable<MessageEvent> {
    const orgId = req.orgId;

    return IngestionService.stream$.asObservable().pipe(
      filter((event: StreamEvent) => event.orgId === orgId),
      map((event: StreamEvent) => ({
        data: JSON.stringify(event),
      } as MessageEvent))
    );
  }
}
