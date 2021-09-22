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
    this.hours = this.getDates(new Date(), new Date(new Date().setDate(new Date().getDate() + this.timeUnits)))
  }

  public timeConvert(n) {
    var num = n;
    var hours = (num / 60);
    var rhours = Math.floor(hours);
    var minutes = (hours - rhours) * 60;
    var rminutes = Math.round(minutes);
    return rhours + '.' + rminutes;
    }

    public getDates(startDate, stopDate) {
      var dateArray = new Array();
      var currentDate = new Date(startDate).setDate(new Date(startDate).getDate() - 1);
      while (currentDate <= stopDate) {
          dateArray.push(currentDate);
          currentDate = new Date(currentDate).setDate(new Date(currentDate).getDate() + 1);
      }
      return dateArray;
  }

}
