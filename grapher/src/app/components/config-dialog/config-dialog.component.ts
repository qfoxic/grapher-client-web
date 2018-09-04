import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { GDiagramService, GDiagram } from '../../services/diagram.service';


@Component({
  selector: 'app-config-dialog',
  templateUrl: './config-dialog.component.html',
})
export class ConfigDialogComponent {
  diagram: GDiagram;

  constructor(public dialogRef: MatDialogRef<ConfigDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data,
              private diagramService: GDiagramService) {
    this.diagram = data.diagram.clone();
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.diagramService.updateDiagram(this.diagram, this.diagramService.currentDiagramId);
    this.dialogRef.close();
  }
}
