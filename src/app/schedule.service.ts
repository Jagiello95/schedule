import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { DragModel } from './components/item.model';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  public tasks = new Map()
  .set(1, [{
    current: 1, 
    name: 'lala',
    start: 60,
    range: 180,
  }])
  .set(2, [{
    current: 2,
    name: 'baba',
    start: 360,
    range: 60,
  },
  {
    current: 2,
    name: 'baba',
    start: 420,
    range: 60,
  },
  // {
  //   current: 2,
  //   name: 'baba',
  //   start: 480,
  //   range: 60,
  // },
  // {
  //   current: 2,
  //   name: 'baba',
  //   start: 540,
  //   range: 60,
  // },
  // {
  //   current: 2,
  //   name: 'baba',
  //   start: 600,
  //   range: 60,
  // },
  // {
  //   current: 2,
  //   name: 'baba',
  //   start: 660,
  //   range: 60,
  // },
  // {
  //   current: 2,
  //   name: 'baba',
  //   start: 720,
  //   range: 60,
  // },
  // {
  //   current: 2,
  //   name: 'baba',
  //   start: 780,
  //   range: 60,
  // },
  // {
  //   current: 2,
  //   name: 'baba',
  //   start: 840,
  //   range: 60,
  // },
  // {
  //   current: 2,
  //   name: 'baba',
  //   start: 900,
  //   range: 60,
  // },
  // {
  //   current: 2,
  //   name: 'baba',
  //   start: 960,
  //   range: 60,
  // },
  // {
  //   current: 2,
  //   name: 'baba',
  //   start: 1020,
  //   range: 60,
  // },
  // {
  //   current: 2,
  //   name: 'baba',
  //   start: 1080,
  //   range: 60,
  // },
  // {
  //   current: 2,
  //   name: 'baba',
  //   start: 1140,
  //   range: 60,
  // },
  // {
  //   current: 2,
  //   name: 'baba',
  //   start: 1200,
  //   range: 60,
  // },
  // {
  //   current: 2,
  //   name: 'baba',
  //   start: 1260,
  //   range: 60,
  // },
  // {
  //   current: 2,
  //   name: 'baba',
  //   start: 1320,
  //   range: 60,
  // },
  // {
  //   current: 2,
  //   name: 'baba',
  //   start: 1380,
  //   range: 60,
  // },
  // {
  //   current: 2,
  //   name: 'baba',
  //   start: 1440,
  //   range: 60,
  // },
  // {
  //   current: 2,
  //   name: 'baba',
  //   start: 1500,
  //   range: 60,
  // },
  // {
  //   current: 2,
  //   name: 'baba',
  //   start: 1560,
  //   range: 60,
  // },
  // {
  //   current: 2,
  //   name: 'baba',
  //   start: 1620,
  //   range: 60,
  // },
  // {
  //   current: 2,
  //   name: 'baba',
  //   start: 1680,
  //   range: 60,
  // },
  // {
  //   current: 2,
  //   name: 'baba',
  //   start: 1740,
  //   range: 60,
  // },
  // {
  //   current: 2,
  //   name: 'baba',
  //   start: 1800,
  //   range: 60,
  // },
  // {
  //   current: 2,
  //   name: 'baba',
  //   start: 1860,
  //   range: 60,
  // },
  // {
  //   current: 2,
  //   name: 'baba',
  //   start: 1920,
  //   range: 60,
  // },
  // {
  //   current: 2,
  //   name: 'baba',
  //   start: 1980,
  //   range: 60,
  // },
  // {
  //   current: 5,
  //   name: 'dada',
  //   start: 2040,
  //   range: 120,
  // }
])
  .set(3,[])
  .set(4,[])
  .set(5,[])
  .set(6,[])
  .set(7,[])
  .set(8,[])
  .set(9,[])
  
  tasks$: Subject<any> = new BehaviorSubject<any>(this.tasks);



  changeTasks(id, id2, task: DragModel) {
    if (id === id2) {
      const newArr = this.tasks.get(id2).filter(obj => obj.name !== task.name)
      this.tasks.set(id2, [...newArr, task] );
      return
    }
    const currentArr = this.tasks.get(id);
    const newArr = this.tasks.get(id2);
    this.tasks.set(id, currentArr.filter(obj => obj.name !== task.name))
    this.tasks.set(id2, [...newArr, {...task, current: id2}] )
  }

  addItem(height: number, top: number, day: number) {
    const newArr = this.tasks.get(day);
    this.tasks.set(day, [...newArr, {current: day, name: 'new', start:top, range:height}] )
  }

  constructor() { }

  public timeConvert(n) {
    n = !isNaN(n) ? n : +n.substring(0, n.length-2)
    var num = 0.75 * n;
    var hours = (num / 60);
    var rhours = Math.floor(hours);
    var minutes = (hours - rhours) * 60;
    var rminutes = Math.round(minutes);
    return rhours + '.' + rminutes;
    }


}
