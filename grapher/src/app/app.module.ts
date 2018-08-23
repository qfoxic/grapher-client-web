import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutModule } from '@angular/cdk/layout';
import { MatButtonModule, MatTooltipModule, MatButtonToggleModule,
         MatIconModule, MatInputModule, MatSelectModule, MatSnackBarModule, MatProgressBarModule } from '@angular/material';
import { UIRouterModule, UIView } from '@uirouter/angular';

import { DiagramComponent } from './components/diagram/diagram.component';
import { GSettingsService } from './services/settings.service';
import { GBackendService } from './services/backend.service';

/*
* TODOs.
* - for each node display id or name.
* - add filtering to backend to extract only necessary data.
* - node shape should contains text and icon. Text should be displayed on the top of icon.
*       inexistent icons should display just gray rounded square.
*
* View Actions:
*   // BUG. Add decorators for transactions
*
* UI:
*   add tooltips for every node.
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
    name: 'app.diagram',
    url: '/diagram/{diagramId:int}',
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
        DiagramComponent
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
