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
  public tasks: Map<number, DragModel[]>;
  public rowsAmount = 200;
  public unit: number;
  public timeUnitsAmount: number;
  public itemHeight: number;
  public skew: number;
  public shiftRight: number;
  public colors = ["lightgoldenrodyellow", "lightcoral", "lightblue", "lightsalmon", "lightseagreen", "lightyellow"]
  public tasks$: Subject<any> = new BehaviorSubject<any>(this.tasks);



  public init(config: ScheduleConfig) {
    this.unit = config.unit;
    this.timeUnitsAmount = config.timeUnitsAmount;
    this.itemHeight = config.itemHeight;
    this.rowsAmount = config.rowsAmount;
    this.skew = config.skew;
    this.shiftRight = config.shiftRight;
    this.tasks = config.items;
    this.prepareInitialData();
  }
  public changeTasks(dragListIndex: number, dropListIndex: number, task: DragModel) {
    if (dragListIndex === dropListIndex) {
      this.tasks.get(dragListIndex).splice(task.index , 1);
      this.tasks.get(dropListIndex).push({...task, current: dragListIndex})
      return;
    }
    this.tasks.get(dragListIndex).splice(task.index, 1);
    this.tasks.get(dropListIndex).push({...task, current: dropListIndex, index: this.tasks.get(dropListIndex).length});
  }

  public ngOnInit() {}



    public getRandomString() {
      return (Math.random() + 1).toString(36).substring(7);
    }

    public getRandomColor() {
      return this.colors[Math.floor(Math.random()*this.colors.length)];
    }

   


}

