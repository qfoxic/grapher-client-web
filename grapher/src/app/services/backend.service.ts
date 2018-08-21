import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { WebSocketSubject } from 'rxjs/webSocket';


export enum StatusMessageType {
  ERROR = 'error',
  INFO = 'info',
  COMMAND_DONE = 'done'
}

export class StatusMessage {
  constructor(public mtype: StatusMessageType, public text?: string) {}
}


@Injectable({
  providedIn: 'root'
})
export class GBackendService {
  private socket$: WebSocketSubject<any>;
  private status: Subject<any>;
  public statusUpdater$: Observable<any>;

  constructor() {
    this.status = new Subject<any>();
    this.statusUpdater$ = this.status.asObservable();
  }

  public init(url: string, onReply: ((msg) => void)): void {
    this.socket$ = new WebSocketSubject<any>(url);
    // Backend service must emit different signals like: running, error, completed.
    this.socket$.subscribe(
      (msg) => {
        if (msg.info) {
          this.status.next(new StatusMessage(StatusMessageType.INFO, msg.info));
          this.status.next(new StatusMessage(StatusMessageType.COMMAND_DONE));
        } else if (msg.error) {
          this.status.next(new StatusMessage(StatusMessageType.ERROR, msg.error));
          this.status.next(new StatusMessage(StatusMessageType.COMMAND_DONE));
        } else {
          onReply(msg);
        }
      },
      (msg) => {
        this.status.next(new StatusMessage(StatusMessageType.COMMAND_DONE));
        this.status.next(new StatusMessage(
          StatusMessageType.ERROR,
          'Could not connect to websocket. Please verify your network connection'
        ));
      });
  }

  public exec(cmd: string): void {
    this.socket$.next(cmd);
  }

  public close(): void {
    this.socket$.unsubscribe();
  }
}
