import { Component, Output, Input, EventEmitter, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { DiagramSettings, GrapherSettingsService } from '../../services/settings.service';


@Component({
  selector: 'grapher-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnDestroy {
  private subscription: Subscription;

  @Input() private currentDiagram: DiagramSettings;

  @Output() menuClicked = new EventEmitter<any>();
  @Output() runCommandClicked = new EventEmitter<string>();

  constructor(private settingsService: GrapherSettingsService) {
    this.subscription = settingsService.diagramChanged$.subscribe(
      diagram => { this.currentDiagram = diagram; }
    );
  }

  onMenuClick() {
      this.menuClicked.emit();
  }

  onRunCommandClick(cmd: string) {
      this.runCommandClicked.emit(cmd);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
