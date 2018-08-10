import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { WebSocketSubject } from 'rxjs/webSocket';

import { DiagramSettings } from '../services/settings.service';


export enum StatusMessageType {
  ERROR = 'error',
  INFO = 'info'
}

export class StatusMessage {
  constructor(public mtype: StatusMessageType, public text: string) {}
}

const CONNECTION_ERROR = new StatusMessage(
  StatusMessageType.ERROR,
  'Could not connect to websocket. Please verify your network connection'
);
const CONNECTION_COMPLETE_INFO = new StatusMessage(
  StatusMessageType.INFO,
  'Websocket closed'
);


@Injectable({
  providedIn: 'root'
})
export class GrapherBackendService {
  private socket$: WebSocketSubject<any>;
  private status: Subject<any>;
  public statusUpdater$: Observable<any>;

  constructor() {
    this.status = new Subject<any>();
    this.statusUpdater$ = this.status.asObservable();
  }

  public init(settings: DiagramSettings, onReply: ((msg) => void)): void {
    this.socket$ = new WebSocketSubject<any>(settings.url);
    // Backend service must emit different signals like: running, error, completed.
    this.socket$.subscribe(
      (msg) => {
        if (msg.info) {
          this.status.next(new StatusMessage(StatusMessageType.INFO, msg.info));
        } else if (msg.error) {
          this.status.next(new StatusMessage(StatusMessageType.ERROR, msg.error));
        } else {
          onReply(msg);
        }
      },
      (msg) => {
        this.status.next(CONNECTION_ERROR);
      },
      () => {
        this.status.next(CONNECTION_COMPLETE_INFO);
      });
  }

  public exec(cmd: string): void {
    this.socket$.next(cmd);
  }

  public close(): void {
    this.socket$.unsubscribe();
  }
}
