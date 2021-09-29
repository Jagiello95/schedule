import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { DragModel } from './components/item.model';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService implements OnInit {
  public placeholderDrop$ = new Subject<void> ();
  public tasks = new Map();
  public roomsAmount = 30;
  public timeUnits = 30;
  public itemHeight = 3;
  public skew = '15deg'
  public colors$ = new BehaviorSubject(["lightgoldenrodyellow", "lightcoral", "lightblue", "lightsalmon", "lightseagreen", "lightyellow"])
  tasks$: Subject<any> = new BehaviorSubject<any>(this.tasks);



  changeTasks(id, id2, task: DragModel) {
    if (id === id2) {
      this.tasks.get(id).splice(task.index , 1);
      this.tasks.get(id).push({...task, current: id})
      return;
    }
    this.tasks.get(id).splice(task.index, 1);
    this.tasks.get(id2).push({...task, current: id2, index: this.tasks.get(id2).length});
  }

  addItem(height: number, top: number, day: number) {
    const newArr = this.tasks.get(day);
    this.tasks.set(day, [...newArr, {current: day, name: 'new', start:top, range:height}] )
  }

  constructor() { 
    for(let i = 0; i < this.roomsAmount; i++) {
      this.tasks.set(
        i, this.returnArr(i)
      )
    }
  }

  public ngOnInit() {

    
    


  }

  public timeConvert(n) {
    n = !isNaN(n) ? n : +n.substring(0, n.length-2)
    var num = 0.75 * n;
    var hours = (num / 60);
    var rhours = Math.floor(hours);
    var minutes = (hours - rhours) * 60;
    var rminutes = Math.round(minutes);
    return rhours + '.' + rminutes;
    }

    public deleteItem(i: number, day: number) {
      const newArr = [...this.tasks.get(day)]
      newArr.splice(i,1)
      this.tasks.set(day, [...newArr]);
    }

    public getRandomString() {
      return (Math.random() + 1).toString(36).substring(7);
    }

    public returnArr(j) {

      let arr = [];
      let num = -1
      for (let i =0; i< this.timeUnits; i++) {
        const rand = Math.round(Math.random());
 
        if (rand) {
          num++
       
        arr.push(
          {
            current: j,
            name: `${j}-baba-${i}`,
            start: i * 60,
            range: 60,
            index: num,
            id: this.getRandomString()
          }
        )
      }
      }
      return arr
    }


}

