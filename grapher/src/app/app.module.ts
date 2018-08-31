import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutModule } from '@angular/cdk/layout';
import { MatButtonModule, MatTooltipModule, MatButtonToggleModule,
         MatIconModule, MatInputModule, MatSelectModule, MatSnackBarModule, MatProgressBarModule } from '@angular/material';
import { UIRouterModule, UIView } from '@uirouter/angular';

import { DiagramComponent } from './components/diagram/diagram.component';
import { ConfigComponent } from './components/config/config.component';
import { GSettingsService } from './services/settings.service';
import { GBackendService } from './services/backend.service';

/*
* TODOs.
*
* CONFIG:
* - if there are no diagrams- redirect to new config edit.
*
* BACKEND.
* - add filtering on aws level to backend to extract only necessary data.
* - instead of displaying node whole data - just provide a link to inspect.
*
* View Actions:
*   // BUG. Add decorators for transactions
*
* UI:
*   add double-clickable node that will open it in AWS Console.
*   disable run button when already running.
*   disable run button when socket connection is closed.
*
* View Actions:
*   Add "view events" system action button. This view should also includes ran commands.
*
* implement config edit as a pop-up.
*   add special section: start up commands to not run the same command every time.
*   add view type.
* */


const STATES = [
  {
    name: 'app',
    component: AppComponent,
    abstract: true,
    resolve: [{
      token: 'settingsService',
      deps: [GSettingsService],
      resolveFn: (s) => s
    }, {
      token: 'backendService',
      deps: [GBackendService],
      resolveFn: (b) => b
    }]
  },
  {
    name: 'app.root',
    url: '/',
    redirectTo: (t) => {
      return t.injector().getAsync('settingsService').then(settingsService => {
        if (!settingsService.diagrams) {
          settingsService.makeDefaultDiagram();
        }
        return { state: 'app.diagram', params: { diagramId: 0 } };
      });
    }
  },
  {
    name: 'app.diagram',
    url: '/diagram/{diagramId:int}',
    views: {
      'content': { component: DiagramComponent }
    },
    onEnter: (t) => {
      t.injector().get('settingsService').changeDiagram(t.params().diagramId);
    }
  }
];


@NgModule({
  declarations: [
    AppComponent,
    DiagramComponent,
    ConfigComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    UIRouterModule.forRoot({
      states: STATES,
    }),
    LayoutModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatButtonToggleModule,
    MatTooltipModule,
    MatProgressBarModule
  ],
  providers: [],
  bootstrap: [UIView]
})
export class AppModule { }
