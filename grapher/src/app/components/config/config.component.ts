import { Component, Input } from '@angular/core';
import { GBackendService } from '../../services/backend.service';
import { GSettingsService } from '../../services/settings.service';


@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss']
})
export class ConfigComponent {
  @Input() private readonly backendService: GBackendService;
  @Input() private readonly settingsService: GSettingsService;

  constructor() {}
}
