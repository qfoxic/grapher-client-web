import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { GDiagram } from '../../services/diagram.service';


@Component({
  selector: 'app-config-dialog',
  templateUrl: './config-dialog.component.html',
})
export class ConfigDialogComponent {
  diagram: GDiagram;

  constructor(public dialogRef: MatDialogRef<ConfigDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data) {
    this.diagram = data.diagram.clone();
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.dialogRef.close({
      diagram: this.diagram, index: this.data.index
    });
  }
}
