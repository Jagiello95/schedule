import { Component, OnInit } from '@angular/core';
import { ColumnModel, RowModel } from './components/aj-schedule/aj-schedule.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public tasks = new Map();
  mockRows: RowModel[];
  mockColumns: ColumnModel[];
  mockRowsAmount = 100
  public colors = ["lightgoldenrodyellow", "lightcoral", "lightblue", "lightsalmon", "lightseagreen", "lightyellow"]

  ngOnInit() {
    this.prepareMockRows();
    this.prepareMockColumns();

  }


  public getDates(startDate: Date, stopDate: Date): Date[] {
    const dateArray = new Array();
    let currentDate = new Date(startDate).setDate(new Date(startDate).getDate() - 1);
    while (currentDate <= stopDate.getTime()) {
        dateArray.push(currentDate);
        currentDate = new Date(currentDate).setDate(new Date(currentDate).getDate() + 1);
    }
    return dateArray;
}

public getHours() {
  return Array.from(Array(this.mockRows.length).keys())
}

public getRandomColor() {
  return this.colors[Math.floor(Math.random()*this.colors.length)];
}

public prepareMockRows() {
  this.mockRows = [...Array(this.mockRowsAmount).keys()].map((_, i: number) => {
    return {
      label: `Room ${i + 1}`,
      color: this.getRandomColor()
    }
  });
}

public prepareMockColumns() {
  this.mockColumns = 

  // // Hours example
  // this.getHours()

  // Date example
  this.getDates(
          new Date(), 
          new Date(new Date().setDate(new Date().getDate() + this.mockRows.length))
      ).map((date: Date)=> {
        return {
          label: date
        }
      });

      
}

public getRandomString() {
  return (Math.random() + 1).toString(36).substring(7);
}

public prepareInitialData() {
  for (let i = 0; i < this.mockRowsAmount; i++) {
    this.tasks.set(
      i, this.prepareItems(i)
    )
  }
}
public prepareItems(j) {

    let arr = [];
    let num = -1
    for (let i =0; i< this.mockColumns.length; i++) {
      const rand = Math.round(Math.random());

      //generate items on half of available space: presentation purposes
      if (rand) {
        num++
     
      arr.push(
        {
          current: j,
          name: `Name-${this.getRandomString()}`,
          start: i * this.unit,
          range: this.unit,
          index: num,
          color: this.getRandomColor(),
          internalId: this.getRandomString()
        }
      )
    }
    }
    return arr
  }

}

