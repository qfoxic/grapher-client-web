import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'grapher-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {

  @Output() menuClicked = new EventEmitter<any>();
  @Output() runCommandClicked = new EventEmitter<string>();

  ngOnInit() { }

  onMenuClick() {
      this.menuClicked.emit();
  }

  onRunCommandClick(cmd: string) {
      this.runCommandClicked.emit(cmd);
  }

}
