import {
  Component, ViewChild, AfterContentInit, Input, OnDestroy, OnInit,
  ElementRef
} from '@angular/core';
import { GBackendService } from '../../services/backend.service';
import {
  GShape, GDiagramService, DiagramMessageType, GLayoutTypes,
  GDiagram
} from '../../services/diagram.service';
import * as go from 'gojs';


const gomk = go.GraphObject.make;

const DEFAULT_GRID_LAYOUT_COLUMNS = 50;


@Component({
  selector: 'app-diagram',
  templateUrl: './diagram.component.html',
  styleUrls: ['./diagram.component.scss']
})
export class DiagramComponent implements AfterContentInit, OnDestroy, OnInit {
  private readonly diag: go.Diagram = new go.Diagram();
  private model: go.GraphLinksModel = new go.GraphLinksModel();

  @Input() private readonly backendService: GBackendService;
  @Input() private readonly diagramService: GDiagramService;

  @ViewChild('diagramDiv') private diagramRef: ElementRef;

  constructor() {
    this.diag.model = this.model;
    this.diag.toolManager.draggingTool.dragsTree = true;
    this.diag.initialContentAlignment = go.Spot.Center;
  }

  private static propertyOf(shapes: Array<GShape>, prop: string) {
    return (t) => shapes.filter((v) => v.name === t)[0][prop];
  }

  private static makeLayout(layout: string | undefined | null): go.Layout {
    switch (layout) {
      case GLayoutTypes.CIRCULAR:
        const lytc = new go.CircularLayout();
        lytc.radius = DEFAULT_GRID_LAYOUT_COLUMNS;
        return lytc;
      case GLayoutTypes.FORCE: return new go.ForceDirectedLayout();
      case GLayoutTypes.GRID:
        const lytg = new go.GridLayout();
        lytg.wrappingColumn = DEFAULT_GRID_LAYOUT_COLUMNS;
        return lytg;
      case GLayoutTypes.DIGRAPH: return new go.LayeredDigraphLayout();
      case GLayoutTypes.TREE: return new go.TreeLayout();
      default:
        const lyt = new go.GridLayout();
        lyt.wrappingColumn = DEFAULT_GRID_LAYOUT_COLUMNS;
        return lyt;
    }
  }

  private makeNodeTemplate(diagram: go.Diagram, curD: GDiagram): void {
    diagram.nodeTemplate = gomk(go.Node, 'Horizontal',
      {
        toolTip:
          gomk(go.Adornment, 'Auto',
            gomk(go.Shape, { fill: '#FFFFCC' }),
            gomk(go.TextBlock, { margin: 4 }, new go.Binding('text', 'key'))
          )
      },
      gomk(go.Shape, { geometryStretch: go.GraphObject.Fill },
        new go.Binding('fill', 'category', DiagramComponent.propertyOf(curD.shapes, 'fill')),
        new go.Binding('figure', 'category', DiagramComponent.propertyOf(curD.shapes, 'figure')),
        new go.Binding('geometryString', 'category',
          DiagramComponent.propertyOf(curD.shapes, 'geometryString'))
      ),
      gomk(go.TextBlock, { overflow: go.TextBlock.WrapDesiredSize, wrap: go.TextBlock.WrapFit },
        new go.Binding('text', 'key')
      )
    );
  }

  public onDataReceived(batch: any): void {
    const first = batch[0];
    // Data are coming in batches so, it's doesn't affect performance too much.
    if (first.category !== 'link') {
      this.model.addNodeDataCollection(batch);
    } else {
      this.model.addLinkDataCollection(batch);
    }
  }

  public onLayoutChanged(layout: string): void {
    this.diag.layout = DiagramComponent.makeLayout(layout);
  }

  public onDiagramClear(): void {
    // TODO. Make this decorator.
    this.diag.startTransaction('clear_model');
    try {
      this.diag.clear();
    } catch (e) {
      this.diag.rollbackTransaction();
    }
    this.diag.commitTransaction('clear_model');
  }

  public onFilterManyLinks(): void {
    this.diag.nodes.each(function(n) {
      const c = n.linksConnected.count;
      n.visible = (c === 0);
    });
  }

  public onFilter0Links(): void {
    this.diag.nodes.each(function(n) {
      const c = n.linksConnected.count;
      n.visible = (c >= 1);
    });
  }

  public onFilterClear(): void {
    this.diag.nodes.each(function(n) {
        n.visible = true;
    });
  }

  public onMakeInitialLayout(): void {
    this.diag.startTransaction('make_initial_layout');
    try {
      this.diag.layout = DiagramComponent.makeLayout(null);
    } catch (e) {
      this.diag.rollbackTransaction();
    }
    this.diag.commitTransaction('make_initial_layout');
  }

  ngAfterContentInit() {
    this.diag.div = this.diagramRef.nativeElement;
  }

  ngOnInit() {
    const curD = this.diagramService.currentDiagram;
    if (!curD) {
      return;
    }

    this.diag.layout = DiagramComponent.makeLayout(curD.defaultLayout);

    this.diagramService.updateDiagram$.subscribe((msg) => {
      switch (msg.changeType) {
        case DiagramMessageType.LAYOUT:
          this.onLayoutChanged(msg.data); break;
        case DiagramMessageType.CLEAR:
          this.onDiagramClear(); break;
        case DiagramMessageType.INITIAL_LAYOUT:
          this.onMakeInitialLayout(); break;
        case DiagramMessageType.FILTER_MANY_LINKS:
          this.onFilterManyLinks(); break;
        case DiagramMessageType.FILTER_0_LINKS:
          this.onFilter0Links(); break;
        case DiagramMessageType.FILTER_CLEAR:
          this.onFilterClear(); break;
        }
      });

    this.makeNodeTemplate(this.diag, curD);

    this.backendService.init(curD.url, this.onDataReceived.bind(this));
    this.backendService.exec(`load ${curD.driver}`);
  }

  ngOnDestroy() {
    this.backendService.close();
  }
}
