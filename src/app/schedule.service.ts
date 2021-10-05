import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { DragModel } from './components/item.model';

export interface ScheduleConfig {
  unit: number,
  timeUnitsAmount: number,
  itemHeight: number,
  rowsAmount: number,
  skew: number,
  shiftRight: number,
  items: Map<number, DragModel[]>;
}

@Injectable({
  providedIn: 'root'
})
export class ScheduleService implements OnInit {
  public items: Map<number, DragModel[]>;
  public rowsAmount = 200;
  public unit: number;
  public timeUnitsAmount: number;
  public itemHeight: number;
  public skew: number;
  public shiftRight: number;
  public colors = ["lightgoldenrodyellow", "lightcoral", "lightblue", "lightsalmon", "lightseagreen", "lightyellow"]
  public items$: Subject<any>



  public init(config: ScheduleConfig) {
    this.unit = config.unit;
    this.timeUnitsAmount = config.timeUnitsAmount;
    this.itemHeight = config.itemHeight;
    this.rowsAmount = config.rowsAmount;
    this.skew = config.skew;
    this.shiftRight = config.shiftRight;
    this.items = config.items;
    this.items$ =  new BehaviorSubject<any>(this.items);
  
  }
  public changeTasks(dragListIndex: number, dropListIndex: number, task: DragModel) {
    if (dragListIndex === dropListIndex) {
      this.items.get(dragListIndex).splice(task.index , 1);
      this.items.get(dropListIndex).push({...task, current: dragListIndex})
      return;
    }
    this.items.get(dragListIndex).splice(task.index, 1);
    this.items.get(dropListIndex).push({...task, current: dropListIndex, index: this.items.get(dropListIndex).length});
  }

  public ngOnInit() {}



    public getRandomString() {
      return (Math.random() + 1).toString(36).substring(7);
    }

    public getRandomColor() {
      return this.colors[Math.floor(Math.random()*this.colors.length)];
    }

   


}

