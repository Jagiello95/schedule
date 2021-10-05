import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ScheduleService } from 'src/app/schedule.service';
import interact from 'interactjs';
import { ItemXComponent } from '../item-x/item-x.component';
import { find, map, switchMap, take, tap} from 'rxjs/operators';
import { combineLatest, of, Subject, Subscription, iif, from} from 'rxjs';
import { RowModel } from '../aj-schedule/aj-schedule.component';
import { RouterLinkWithHref } from '@angular/router';

@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.scss']
})
export class ItemListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren(ItemXComponent) items: QueryList<ItemXComponent>
  @Input() index: number;
  @Input() row: RowModel;
  public allowedUnits = [];
  public color: string;
  public skew = this.service.skew;
  public unit = this.service.unit;
  public itemHeight = this.service.itemHeight;
  public timeUnitsAmount = this.service.timeUnitsAmount;
  public itemListWidth = this.timeUnitsAmount * this.unit;
  public id: string

  public forbiddenIndexes$ = new Subject<number[][]>();
  public resizeSub: Subscription;
  public itemsChangeSub: Subscription;


  constructor(public el:ElementRef, public service: ScheduleService, public cdRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.id = this.row.label;
    this.color = this.row.color;
    interact(this.el.nativeElement)
      .dropzone({})
      .on('drop', event => {
        this.handleDrop(event)
        this.prepareForbiddenFieldsList();
      })
  }

  ngAfterViewInit(): void {
    this.prepareForbiddenFieldsList();
    this.onItemChange();
    this.assignSubscriptions();
  }

  ngOnDestroy(): void {
    this.resolveSubscriptions();
  }

  public identify(_index, item): string {
    return item.internalId;
 }

  public prepareForbiddenFieldsList(optional?): void {
    of(true).pipe(
      map(()=> optional ? this.items.filter((item)=> item.start !== optional.start): Array.from(this.items)),
      map((res) => res.map((item: ItemXComponent) => item.sizeChange$)),
      switchMap((items) => 
      iif(() => !!items.length
      , combineLatest(items)
      , of(null)
      )),
      tap((res)=> {
        this.prepareAllowedIndexes(res)
      }),
      take(1),
      map((arr => arr?.map((el)=> [Math.round((el[0] / this.unit) * this.unit), Math.round((el[1] / this.unit) * this.unit)])))
    ).subscribe((el)=> {
      if (el) {
        this.forbiddenIndexes$.next(el);
        this.cdRef.detectChanges();
      }})
  }

  public onFreeSpace(model): void {
    this.prepareForbiddenFieldsList(model)
  }

  public prepareAllowedIndexes(res): void {
    if (!res) {
      this.allowedUnits = [[0, this.timeUnitsAmount]];
      return;
    }
    let last = 0;
    let allowedUnits = [];
    const result = res.sort((a,b) => a[0]-b[0]);
    result.forEach((el, i)=> {
      const start = Math.round((el[0]/ this.unit) * this.unit);
      const range = el[1]
      const output = [last, start-last];
      last = start + range 
      allowedUnits.push(output);
      if(i + 1 === res.length) {
        allowedUnits.push([last, this.timeUnitsAmount-last] )
      }
      // return el[0] + el[1]
    })
    this.allowedUnits = allowedUnits
  }

  public assignSubscriptions(): void {
    this.itemsChangeSub = this.items.changes.pipe(tap(()=> {
    this.onItemChange()
    
    })).subscribe();
  }

  public onItemChange(): void {
    this.prepareForbiddenFieldsList();
    this.resizeSub && this.resizeSub.unsubscribe();
    this.resizeSub = combineLatest(this.items.map((item)=> item.resizeEnd$)).subscribe(
      () => {
        this.prepareForbiddenFieldsList();
      }
    )
  }

  private resolveSubscriptions(): void {
    this.resizeSub.unsubscribe();
    this.itemsChangeSub.unsubscribe();
  }

  private handleDrop(event): void {
    if (ItemXComponent.counter < 4000) {
      event.relatedTarget.classList.add('animated');
    }

    const rounded = {
      start: Math.round(event.relatedTarget.offsetLeft / this.unit),
      end: Math.round((event.relatedTarget.offsetLeft + event.relatedTarget.clientWidth) / this.unit)
    }

    from(this.allowedUnits).pipe(
      find((el)=> (rounded.start >= el[0] && rounded.end <= el[0] + el[1])),
      take(1)
    ).subscribe(
      (res) => {
        if (!res) {
          const model = {...(window as any).dragData, start: rounded.start * this.unit };

          event.relatedTarget.style.left = event.relatedTarget.dataset.originalLeft + 'px';
          event.relatedTarget.style.top = 0;
          event.relatedTarget.dataset.left = event.relatedTarget.dataset.originalLeft;
          event.relatedTarget.dataset.top = 0;
          setTimeout(()=> {

            this.service.changeTasks(
              (window as any).dragData.current,
              (window as any).dragData.current,
              {...model, start: event.relatedTarget.dataset.originalLeft, internalId: this.service.getRandomString()});
            event.relatedTarget.classList.remove(['animated', 'top']);

          },300)
          return;
        }
      const model = {...(window as any).dragData, start: rounded.start * this.unit };
      this.service.changeTasks((window as any).dragData.current, this.index, {...model, internalId: this.service.getRandomString()},);
  });
  };
}
