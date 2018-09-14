import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';


export enum GLayoutTypes {
  CIRCULAR = 'circular',
  FORCE = 'force',
  GRID = 'grid',
  DIGRAPH = 'digraph',
  TREE  = 'tree'
}


export const LAYOUT_ICONS_MAP: Map<GLayoutTypes, string> = new Map<GLayoutTypes, string>([
  [GLayoutTypes.CIRCULAR, 'blur_circular'],
  [GLayoutTypes.GRID, 'blur_linear'],
  [GLayoutTypes.DIGRAPH, 'device_hub'],
  [GLayoutTypes.FORCE, 'blur_on'],
  [GLayoutTypes.TREE, 'share']
]);


const STORAGE_TYPE = 'localStorage';
const PREFIX = 'grapher';
const DIAGRAMS_KEY = 'diagrams';

const DEFAULT_DIAGRAM = {
  'name': 'test_view',
  'url': 'ws://127.0.0.1:9999',
  'driver': 'aws',
  'shapes': [],
  'layouts': [
    {
      'ltype': GLayoutTypes.GRID,
      'tip': 'Display data in a grid'
    },
    {
      'ltype': GLayoutTypes.DIGRAPH,
      'tip': 'Display data in a digraph. Be carefull, rendering is very slow'
    },
    {
      'ltype': GLayoutTypes.TREE,
      'tip': 'Display data in a tree'
    },
    {
      'ltype': GLayoutTypes.CIRCULAR,
      'tip': 'Display data in a circle'
    },
    {
      'ltype': GLayoutTypes.FORCE,
      'tip': 'Display data in a tree with forces'
    }
  ]
};


export class GShape {
  readonly name: string;
  readonly figure: string;
  readonly fill: string;
  readonly geometryString: string;

  constructor({name, figure, fill, geometryString}) {
    this.name = name;
    this.figure = figure;
    this.fill = fill;
    this.geometryString = geometryString;
  }

  static isValid(obj: any): obj is GShape {
    return (
      obj.name !== undefined &&
      obj.fill !== undefined && (obj.figure !== undefined || obj.geometryString !== undefined)
    );
  }
}


export class GLayout {
  readonly ltype: GLayoutTypes;
  readonly tip: string;

  constructor({ltype, tip}) {
    this.ltype = ltype;
    this.tip = tip;
  }

  static isValid(obj: any): obj is GLayout {
    return (
      obj.ltype !== undefined && obj.tip !== undefined
    );
  }
}


export class GDiagram {
  readonly name: string;

  // Websocket Connection url
  readonly url: string;

  // Driver type, like aws.
  readonly driver: string;

  readonly shapes: Array<GShape> = new Array<GShape>();

  readonly layouts: Array<GLayout> = new Array<GLayout>();

  static isValid(obj: any): obj is GDiagram {
    return (
      obj.name !== undefined &&
      obj.url !== undefined && obj.driver !== undefined
    );
  }

  constructor({name, url, driver,
               shapes = new Array<GShape>(), layouts = new Array<GLayout>()}) {
    this.name = name;
    this.url = url;
    this.driver = driver;

    for (const shape of shapes) {
      if (GShape.isValid(shape)) {
        this.shapes.push(new GShape(shape));
      }
    }
    for (const layout of layouts) {
      if (GLayout.isValid(layout)) {
        this.layouts.push(new GLayout(layout));
      }
    }
  }

  public get defaultLayout(): string {
    return this.layouts.length > 0 ? this.layouts[0].ltype : GLayoutTypes.GRID;
  }

  public layoutIcon(ltype: GLayoutTypes): string {
    return LAYOUT_ICONS_MAP.get(ltype);
  }

  public clone(): GDiagram {
    return JSON.parse(JSON.stringify(this));
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
    this._load();
  }

  public get diagrams(): Array<GDiagram> | null {
    return (this._diagrams.length > 0) ? this._diagrams : null;
  }

  public addDiagram(diagram: GDiagram): number {
    const index: number = this._diagrams.push(diagram);
    this._flush();
    return index - 1;
  }

  public updateDiagram(dIndex: number, diagram: GDiagram): void {
    this._diagrams[dIndex] = diagram;
    this._flush();
  }

  public deleteDiagram(index: number): void {
    this._diagrams.splice(index, 1);
    this._flush();
  }

  private _load(): void {
    const items = JSON.parse(this.storage.getItem(this._formatKey(DIAGRAMS_KEY))) || [];
    for (const item of items) {
      if (GDiagram.isValid(item)) {
        this._diagrams.push(new GDiagram(item));
      }
    }
  }

  private _flush(): void {
    this.storage.setItem(
      this._formatKey(DIAGRAMS_KEY),
      JSON.stringify(this._diagrams)
    );
  }

  private _formatKey(key: string): string {
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
export class GDiagramService {

  private storage: GStorage;
  private curDiagramId: number;
  private diagramSubject: Subject<DiagramMessage>;
  public updateDiagram$: Observable<DiagramMessage>;

  constructor() {
    this.storage = new GStorage();
    this.diagramSubject = new Subject<DiagramMessage>();
    this.updateDiagram$ = this.diagramSubject.asObservable();
  }

  public makeDefaultDiagram(): number {
    return this.storage.addDiagram(new GDiagram(DEFAULT_DIAGRAM));
  }

  public updateDiagram(dIndex: number, diagram: GDiagram): void {
    this.storage.updateDiagram(dIndex, diagram);
  }

  public deleteDiagram(dIndex: number): void {
    this.storage.deleteDiagram(dIndex);
  }

  public changeDiagram(diagramId: number): void {
    this.curDiagramId = diagramId;
  }

  public changeDiagramLayout(layout: string): void {
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

  public get diagrams(): Array<GDiagram> | null {
    return this.storage.diagrams;
  }

  public get currentDiagram(): GDiagram | null {
    return (this.diagrams) ? this.storage.diagrams[this.curDiagramId] : null;
  }

  public get currentDiagramId(): number {
    return this.curDiagramId;
  }

  public close(): void {
    this.diagramSubject.unsubscribe();
  }
}

/*
const test_config = [{
  "name": "test_view1", "url": "ws://127.0.0.1:9999",
  "driver": "aws",
  "shapes": [{"name": "ec2", "fill": "red", "figure": "Diamond"},
             {"name": "sg", "fill": "green", "figure": "Ellipse"}],
  "layouts": [
    {"ltype": "grid", "tip": "Display data in a grid"},
    {"ltype": "digraph", "tip": "Display data in a digraph"},
    {"ltype": "tree", "tip": "Display data in a tree"},
    {"ltype": "circular", "tip": "Display data in a circle"},
    {"ltype": "force", "tip": "Display data in a tree with forces"}],
  {"name": "test_view2", "url": "ws://127.0.0.1:9999", "driver": "aws"}]
*/
