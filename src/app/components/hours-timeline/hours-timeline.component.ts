import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-hours-timeline',
  templateUrl: './hours-timeline.component.html',
  styleUrls: ['./hours-timeline.component.scss']
})
export class HoursTimelineComponent implements OnInit {
  public hours
  @Input() unit: number;
  @Input() timeUnits: number;
  @Input() axis;
  constructor() { }

  ngOnInit(): void {
    this.hours = new Array(this.timeUnits).fill(1);
  }

  public timeConvert(n) {
    var num = n;
    var hours = (num / 60);
    var rhours = Math.floor(hours);
    var minutes = (hours - rhours) * 60;
    var rminutes = Math.round(minutes);
    return rhours + '.' + rminutes;
    }

}
