import { MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
export declare class StreamController {
    streamLiveEvents(req: any): Observable<MessageEvent>;
}
