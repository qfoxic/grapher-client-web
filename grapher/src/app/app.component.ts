import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { Subscription } from 'rxjs';
import { GrapherSettingsService, DiagramSettings } from './services/settings.service';
import { GrapherBackendService } from './services/backend.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy, OnInit {
  private backendSubsciption: Subscription;

  @Input() private readonly currentDiagram: DiagramSettings;
  @Input() private readonly settingsService: GrapherSettingsService;
  @Input() private readonly backendService: GrapherBackendService;

  constructor(public snackBar: MatSnackBar) {}

  public execCmd(cmd: string) {
    this.backendService.exec(cmd);
  }

  ngOnInit() {
    this.backendSubsciption = this.backendService.statusUpdater$.subscribe(
      msg => { this.snackBar.open(msg.text, '', { duration: 3000, panelClass: msg.mtype }); }
    );
  }

  ngOnDestroy() {
    this.backendSubsciption.unsubscribe();
  }
}
