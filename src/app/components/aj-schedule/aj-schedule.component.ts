import { AfterViewChecked, AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { ScheduleService } from 'src/app/schedule.service';
import { ItemXComponent } from '../item-x/item-x.component';

@Component({
  selector: 'app-aj-schedule',
  templateUrl: './aj-schedule.component.html',
  styleUrls: ['./aj-schedule.component.scss']
})
export class AjScheduleComponent implements AfterViewInit {
  public timeUnits = this.service.timeUnits;
  public rooms =  new Array(this.service.roomsAmount);
  public numberOfReservations: number; 
  private _unit: number;

  @Input() axis = "x"
  @Input() set unit(unit:number) {
    this._unit = unit;
  }

  get unit():number {
    return this._unit
  }

  constructor(public service: ScheduleService) {}

  ngAfterViewInit() {
    this.numberOfReservations = ItemXComponent.counter;
  }
}
