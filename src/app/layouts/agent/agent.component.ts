import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-agent',
  templateUrl: './agent.component.html',
  styleUrls: ['./agent.component.scss']
})
export class AgentComponent implements OnInit {
  menuWidth: number;
  checkSizeOfEvent: boolean = false;
  windowWidth: number;
  constructor() { }

  ngOnInit(): void {
    this.menuWidth = window.innerWidth < 768 ? 70 : 270;
    this.windowWidth = window.innerWidth;
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.menuWidth = (window.innerWidth < 768 || this.checkSizeOfEvent) ? 70 : 270;
    this.windowWidth = window.innerWidth;

  }

  onResizeValue(event) {
    this.checkSizeOfEvent = event;
    this.menuWidth = event ? 70 : 270;
  }
}
