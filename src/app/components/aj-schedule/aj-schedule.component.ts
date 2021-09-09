import { Component, Input, OnInit } from '@angular/core';
import { ScheduleService } from 'src/app/schedule.service';

@Component({
  selector: 'app-aj-schedule',
  templateUrl: './aj-schedule.component.html',
  styleUrls: ['./aj-schedule.component.scss']
})
export class AjScheduleComponent implements OnInit {
  public timeUnits = 24;
  title = 'schedule';
  private _unit: number;
  @Input() axis = "x"
  @Input() set unit(unit:number) {
    this._unit = unit;
  }

  get unit():number {
    return this._unit
  }
  public boxSpec;

  
  constructor(public service: ScheduleService) {
  
  }
  
  ngOnInit() {
  
  }
  
  

  
    
    identify(index, item){
      return item.name; 
   }

}
