import {
  Component, ViewChild, AfterContentInit, Input, OnDestroy, OnInit,
  ElementRef
} from '@angular/core';
import { GrapherBackendService } from '../../services/backend.service';
import { DiagramSettings } from '../../services/settings.service';

import * as go from 'gojs';


@Component({
  selector: 'grapher-diagram',
  templateUrl: './diagram.component.html',
  styleUrls: ['./diagram.component.scss']
})
export class DiagramComponent implements AfterContentInit, OnDestroy, OnInit {
  private readonly diagram: go.Diagram;

  @Input() private readonly backendService: GrapherBackendService;
  @Input() private readonly currentDiagram: DiagramSettings;

  @ViewChild('diagramDiv') private diagramRef: ElementRef;

  constructor() {
    this.diagram = new go.Diagram();
    this.diagram.model = new go.GraphLinksModel(
    [
      { key: 1, text: 'Alpha', color: 'lightblue' },
      { key: 2, text: 'Beta', color: 'orange' },
      { key: 3, text: 'Gamma', color: 'lightgreen' },
      { key: 4, text: 'Delta', color: 'red' }
    ],
    [
      { from: 1, to: 2 },
      { from: 1, to: 3 },
      { from: 2, to: 2 },
      { from: 3, to: 4 },
      { from: 4, to: 1 }
    ]);
  }

  public onDataReceived(msg): void {
    console.log(`hello ${msg}`);
  }

  ngAfterContentInit() {
    this.diagram.div = this.diagramRef.nativeElement;
  }

  ngOnInit() {
    this.backendService.init(this.currentDiagram, this.onDataReceived);

    const driver: string = this.currentDiagram.driver;
    this.backendService.exec(`load ${driver}`);
  }

  ngOnDestroy() {
    this.backendService.close();
  }
}
