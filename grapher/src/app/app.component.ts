import { Component, Input } from '@angular/core';
import { GrapherSettingsService, DiagramSettings } from './services/settings.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @Input() private currentDiagram: DiagramSettings;
  @Input() private settingsService: GrapherSettingsService;
}
