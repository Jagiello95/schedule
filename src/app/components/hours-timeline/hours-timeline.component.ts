import { Component, Input, OnInit } from '@angular/core';
import { ScheduleService } from 'src/app/schedule.service';

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
  public itemHeight = this.service.itemHeight;
  
  constructor(public service: ScheduleService) { }

  ngOnInit(): void {
    this.hours = this.getDates(new Date(), new Date(new Date().setDate(new Date().getDate() + this.timeUnits)))
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
