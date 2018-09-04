import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar, MatDialog } from '@angular/material';
import { Subscription } from 'rxjs';
import { GBackendService, StatusMessageType } from './services/backend.service';
import { GDiagramService } from './services/diagram.service';
import { ConfigDialogComponent } from './components/config-dialog/config-dialog.component';


const PROGRESS_DETERMINATE = 'determinate';
const PROGRESS_INDETERMINATE = 'indeterminate';

const CONFIG_DIALOG_WIDTH = '250px';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy, OnInit {
  private bs: Subscription;

  private progressMode: 'determinate' | 'indeterminate';

  @Input() private readonly backendService: GBackendService;
  @Input() private readonly diagramService: GDiagramService;

  constructor(public snackBar: MatSnackBar, public configDialog: MatDialog) {
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

  public showConfigDialog(): void {
    this.configDialog.open(ConfigDialogComponent, {
      width: CONFIG_DIALOG_WIDTH,
      data: { diagram: this.diagramService.currentDiagram }
    });
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
