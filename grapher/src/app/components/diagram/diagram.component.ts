import { Component, ViewChild, AfterContentInit, Input } from '@angular/core';
import * as go from 'gojs';

@Component({
  selector: 'grapher-diagram',
  templateUrl: './diagram.component.html',
  styleUrls: ['./diagram.component.scss']
})
export class DiagramComponent implements AfterContentInit {
  private diagram: go.Diagram;

  @ViewChild('diagramDiv') diagramRef;

  @Input()
  get model(): go.Model { return this.diagram.model; }
  set model(val: go.Model) { this.diagram.model = val; }

  constructor() {
    this.diagram = new go.Diagram();
    this.diagram.model = new go.GraphLinksModel(
    [
      { key: 1, text: "Alpha", color: "lightblue" },
      { key: 2, text: "Beta", color: "orange" },
      { key: 3, text: "Gamma", color: "lightgreen" },
      { key: 4, text: "Delta", color: "pink" }
    ],
    [
      { from: 1, to: 2 },
      { from: 1, to: 3 },
      { from: 2, to: 2 },
      { from: 3, to: 4 },
      { from: 4, to: 1 }
    ]);
  }

  ngAfterContentInit() {
    this.diagram.div = this.diagramRef.nativeElement;
  }

}
