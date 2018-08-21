import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { Subscription } from 'rxjs';
import { GSettingsService } from './services/settings.service';
import { GBackendService, StatusMessageType } from './services/backend.service';


const PROGRESS_DETERMINATE = 'determinate';
const PROGRESS_INDETERMINATE = 'indeterminate';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy, OnInit {
  private bs: Subscription;

  private progressMode: 'determinate' | 'indeterminate';

  @Input() private readonly settingsService: GSettingsService;
  @Input() private readonly backendService: GBackendService;

  constructor(public snackBar: MatSnackBar) {
    this.initProgress();
  }

  public initProgress() {
    this.progressMode = PROGRESS_DETERMINATE;
  }

  public startProgress() {
    this.progressMode = PROGRESS_INDETERMINATE;
  }

  public stopProgress() {
    this.progressMode = PROGRESS_DETERMINATE;
  }

  public showSnackBar(msg: string, duration: number, mtype: string) {
    this.snackBar.open(msg, '', { duration: duration, panelClass: mtype});
  }

  public execCmd(cmd: string) {
    this.startProgress();
    this.backendService.exec(cmd);
  }

  ngOnInit() {
    // const self = this;
    this.bs = this.backendService.statusUpdater$.subscribe(
      msg => {
        switch (msg.mtype) {
          case StatusMessageType.COMMAND_DONE:  this.stopProgress(); break;
          case StatusMessageType.ERROR: this.showSnackBar(msg.text, 3000, StatusMessageType.ERROR); break;
          case StatusMessageType.INFO: this.showSnackBar(msg.text, 3000, StatusMessageType.INFO); break;
          default: break;
        }
      }
    );
  }

  ngOnDestroy() {
    this.bs.unsubscribe();
  }
}
