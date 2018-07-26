import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ViewSettings } from '../../services/settings.service';

@Component({
  selector: 'grapher-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit {
  @Input() private views: Array<ViewSettings>;

  @ViewChild('sideNav') private sNav;

  ngOnInit() {  }

  toggleSideNav () {
    this.sNav.toggle();
  }

}
