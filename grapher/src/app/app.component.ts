import { Component, OnInit } from '@angular/core';
import { GrapherSettingsService, ViewSettings } from './services/settings.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  views: Array<ViewSettings>;

  constructor(settings: GrapherSettingsService) {
    this.views = settings.getViews();
  }

  ngOnInit() {}
}
