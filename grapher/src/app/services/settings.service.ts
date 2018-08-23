import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';


const STORAGE_TYPE = 'localStorage';
const PREFIX = 'grapher';
const DIAGRAMS_KEY = 'diagrams';


export class GShape {
  readonly figure: string;
  readonly fill: string;
  readonly geometryString: string;

  constructor({figure, fill, geometryString}) {
    this.figure = figure;
    this.fill = fill;
    this.geometryString = geometryString;
  }

  static isValid(obj: any): obj is GShape {
    return (
      obj.fill !== undefined && (obj.figure !== undefined || obj.geometryString !== undefined)
    );
  }
}


export enum GLayoutTypes {
  CIRCULAR = 'circular',
  FORCE = 'force',
  GRID = 'grid',
  DIGRAPH = 'digraph',
  TREE  = 'tree'
}

type GLayoutKeys = GLayoutTypes.CIRCULAR | GLayoutTypes.FORCE | GLayoutTypes.GRID | GLayoutTypes.DIGRAPH | GLayoutTypes.TREE;


export class GLayout {
  readonly icon: string;
  readonly tip: string;

  constructor({tip, icon}) {
    this.tip = tip;
    this.icon = icon;
  }

  static isValid(obj: any): obj is GLayout {
    return (
      obj.tip !== undefined && obj.icon !== undefined
    );
  }
}


export class GDiagram {
  // Title will be displayed in a toolbar.
  readonly title: string;

  // Used as an id field;
  readonly name: string;

  // Websocket Connection url
  readonly url: string;

  // Driver type, like aws.
  readonly driver: string;

  readonly shapes: Map<string, GShape>;

  readonly layouts: Map<GLayoutKeys, GLayout>;

  readonly layoutTypes: Array<string>;

  static isValid(obj: any): obj is GDiagram {
    return (
      obj.title !== undefined && obj.name !== undefined &&
      obj.url !== undefined && obj.driver !== undefined
    );
  }

  constructor({title, name, url, driver, shapes, layouts}) {
    this.title = title;
    this.name = name;
    this.url = url;
    this.driver = driver;
    this.shapes = new Map<string, GShape>();
    this.layouts = new Map<GLayoutKeys, GLayout>();
    this.layoutTypes = new Array<string>();

    for (const shape in shapes) {
      if (GShape.isValid(shapes[shape])) {
        this.shapes.set(shape, new GShape(shapes[shape]));
      }
    }
    for (const layout in layouts) {
      if (GLayout.isValid(layouts[layout])) {
        this.layouts.set(<GLayoutKeys>layout, new GLayout(layouts[layout]));
      }
    }
    this.layouts.forEach((v, k) => { this.layoutTypes.push(k); }, this);
  }

  public get defaultLayout(): string {
    return this.layoutTypes[0];
  }
}


class GStorage {
  private readonly prefix: string;
  private readonly storage: Storage;
  private _diagrams: Array<GDiagram>;

  constructor() {
    this.storage = window[STORAGE_TYPE];
    this.prefix = PREFIX;
    this._diagrams = new Array<GDiagram>();

    this.loadDiagrams();
  }

  public get diagrams(): Array<GDiagram> {
    return this._diagrams;
  }

  private loadDiagrams(): void {
    const items = JSON.parse(this.storage.getItem(this.formatKey(DIAGRAMS_KEY)));
    for (const item of items) {
      if (GDiagram.isValid(item)) {
        this._diagrams.push(new GDiagram(item));
      }
    }
  }

  private formatKey(key: string): string {
    return `${this.prefix}${key}`;
  }
}


export enum DiagramMessageType {
  LAYOUT,
  INITIAL_LAYOUT,
  CLEAR,
  FILTER_0_LINKS,
  FILTER_MANY_LINKS,
  FILTER_CLEAR
}


export class DiagramMessage {
  constructor(public changeType: DiagramMessageType,
              public data?: string) {}
}


@Injectable({
  providedIn: 'root'
})
export class GSettingsService {

  private storage: GStorage;
  private curDiagramId: number;
  private diagramSubject: Subject<DiagramMessage>;
  public updateDiagram$: Observable<DiagramMessage>;

  constructor() {
    this.storage = new GStorage();
    this.diagramSubject = new Subject<DiagramMessage>();
    this.updateDiagram$ = this.diagramSubject.asObservable();
  }

  public changeCurrentDiagram(diagramId: number): void {
    this.curDiagramId = diagramId;
  }

  public changeCurrentDiagramLayout(layout: string): void {
    this.diagramSubject.next(new DiagramMessage(
      DiagramMessageType.LAYOUT,
      layout
    ));
  }

  public clearDiagram(): void {
    this.diagramSubject.next(new DiagramMessage(
      DiagramMessageType.CLEAR
    ));
  }

  public displayManyLinks(): void {
    this.diagramSubject.next(new DiagramMessage(
      DiagramMessageType.FILTER_0_LINKS
    ));
  }

  public displayNoLinks(): void {
    this.diagramSubject.next(new DiagramMessage(
      DiagramMessageType.FILTER_MANY_LINKS
    ));
  }

  public filterClear(): void {
    this.diagramSubject.next(new DiagramMessage(
      DiagramMessageType.FILTER_CLEAR
    ));
  }

  public makeInitialLayout(): void {
    this.diagramSubject.next(new DiagramMessage(
      DiagramMessageType.INITIAL_LAYOUT
    ));
  }

  public get diagrams(): Array<GDiagram> {
    return this.storage.diagrams;
  }

  public get currentDiagram(): GDiagram {
    return this.storage.diagrams[this.curDiagramId];
  }

  public get currentDiagramId(): number {
    return this.curDiagramId;
  }

  public close(): void {
    this.diagramSubject.unsubscribe();
  }
}


const test_config = [
 {"title":"view1", "name": "test_view1", "url": "ws://127.0.0.1:9999", "driver": "aws",
 "shapes": {
        "ec2": {"fill": "red", "figure": "Diamond"},
        "sg": {"fill": "green", "figure": "Ellipse"}
 },
   "layouts": {
        "circular": {"tip": "Display data in a circle", "icon": "C"},
        "force": {"tip": "Display in a tree with forces", "icon": "F"}
  }
 },
  {"title":"view2", "name": "test_view2", "url": "ws://127.0.0.1:9999", "driver": "aws"}]
