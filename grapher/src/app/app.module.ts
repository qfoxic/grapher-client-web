import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule,
         MatButtonModule, MatSidenavModule, MatIconModule, MatListModule, MatCardModule,
         MatInputModule, MatSelectModule } from '@angular/material';
import { UIRouterModule } from '@uirouter/angular';

import { EcoFabSpeedDialActionsComponent,
         EcoFabSpeedDialComponent,
         EcoFabSpeedDialTriggerComponent } from './components/speed-dial/speed-dial.component';
import { DiagramComponent } from './components/diagram/diagram.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { ViewComponent } from './components/view/view.component';


const STATES = [
    {
        name: 'app',
        url: '/',
        component: AppComponent
    },
    {
        // TODO. Add viewid
        name: 'app.view',
        url: 'view',
        component: ViewComponent
    }
];


@NgModule({
    declarations: [
        AppComponent,
        EcoFabSpeedDialActionsComponent,
        EcoFabSpeedDialComponent,
        EcoFabSpeedDialTriggerComponent,
        DiagramComponent,
        ToolbarComponent,
        SidenavComponent,
        ViewComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        UIRouterModule.forRoot({
            states: STATES
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
    bootstrap: [AppComponent]
})
export class AppModule { }
