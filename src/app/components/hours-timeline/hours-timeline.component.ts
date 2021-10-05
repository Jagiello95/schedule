import { Component, Input, OnInit } from '@angular/core';
import { ScheduleService } from 'src/app/schedule.service';
import { ColumnModel } from '../aj-schedule/aj-schedule.component';

@Component({
  selector: 'app-hours-timeline',
  templateUrl: './hours-timeline.component.html',
  styleUrls: ['./hours-timeline.component.scss']
})
export class HoursTimelineComponent implements OnInit {
  @Input() columns: ColumnModel;
  public unit = this.service.unit;
  public timeUnitsAmount = this.service.timeUnitsAmount;
  public timeUnits: Date[] | number[];
  public itemHeight = this.service.itemHeight;
  
  constructor(public service: ScheduleService) { }

  ngOnInit(): void {
  }

}
