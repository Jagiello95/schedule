import { AfterViewChecked, AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { ScheduleService } from 'src/app/schedule.service';
import { ItemXComponent } from '../item-x/item-x.component';
import { DragModel } from '../item.model';

export interface RowModel {
  label: string,
  color?:string
}

export interface ColumnModel {
  label: Date,
}


@Component({
  selector: 'app-aj-schedule',
  templateUrl: './aj-schedule.component.html',
  styleUrls: ['./aj-schedule.component.scss']
})
export class AjScheduleComponent implements AfterViewInit, OnInit {
  @Input() public unit: number;
  @Input() public timeUnitsAmount: number;
  @Input() public itemHeight: number;
  @Input() public shiftRight: number;
  @Input() public skew: number;
  @Input() public showGrid: boolean = true;;

  @Input() public items: Map<number,DragModel[]>;
  @Input() public set rows(rows:RowModel[]) {
    this._rows = rows
  }

  public get rows(): RowModel[] {
    return this._rows;
  }

  @Input() public set columns(columns:ColumnModel[]) {
    this._columns = columns
  }

  public get columns(): ColumnModel[] {
    return this._columns;
  }


  public rooms: number[];
  public numberOfItems: number;
  public scheduleWidth: number;

  private _rows: RowModel[];
  private _columns: ColumnModel[];

  constructor(public service: ScheduleService) {}

  ngOnInit() {
    this.service.init({
      unit: this.unit,
      timeUnitsAmount: this.timeUnitsAmount,
      itemHeight: this.itemHeight,
      rowsAmount: this.rows.length,
      skew: this.skew,
      shiftRight: this.shiftRight,
      items: this.items
    })
    this.scheduleWidth = this.unit * this.timeUnitsAmount;
  }

  ngAfterViewInit(): void {
    this.numberOfItems = ItemXComponent.counter;
  }

  public getData() {}

  public identify(row: RowModel) {
    return row.label;
  }
}
