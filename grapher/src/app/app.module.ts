import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule,
         MatButtonModule, MatSidenavModule, MatIconModule, MatListModule, MatCardModule,
         MatInputModule, MatSelectModule } from '@angular/material';
import { UIRouterModule, UIView, Transition } from '@uirouter/angular';

import { EcoFabSpeedDialActionsComponent,
         EcoFabSpeedDialComponent,
         EcoFabSpeedDialTriggerComponent } from './components/speed-dial/speed-dial.component';
import { DiagramComponent } from './components/diagram/diagram.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { GrapherSettingsService } from './services/settings.service';

/*
* TODOs.
* implement config edit.
* Implement actually backend communication.
* */


const STATES = [
  {
    // TODO. Redirect to a first view.
    name: 'app',
    component: AppComponent,
    abstract: true,
    resolve: [{
      token: 'settingsService',
      deps: [GrapherSettingsService],
      resolveFn: (s) => s
    }, {
      token: 'currentDiagram',
      deps: [GrapherSettingsService, Transition],
      resolveFn: (s, t) => s.diagrams[t.params().diagramId],
    }]
  },
  {
    name: 'app.diagram',
    url: '/diagram/:diagramId',
    views: {
      'content': { component: DiagramComponent }
    },
    onEnter: (t) => {
      t.injector().get('settingsService').changeCurrentDiagram(t.params().diagramId);
    }
  }
];


@NgModule({
    declarations: [
        AppComponent,
        EcoFabSpeedDialActionsComponent,
        EcoFabSpeedDialComponent,
        EcoFabSpeedDialTriggerComponent,
        DiagramComponent,
        ToolbarComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        UIRouterModule.forRoot({
            states: STATES,
        }),
        LayoutModule,
        MatToolbarModule,
        MatButtonModule,
        MatSidenavModule,
        MatIconModule,
        MatListModule,
        MatCardModule,
        MatInputModule,
        MatSelectModule
    ],
    providers: [],
    bootstrap: [UIView]
})
export class AppModule { }
