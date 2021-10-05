import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChildren, ElementRef, HostBinding, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { ScheduleService } from 'src/app/schedule.service';
import interact from 'interactjs';
import { EventEmitter } from '@angular/core';
import { ItemXComponent } from '../item-x/item-x.component';
import { filter, find, map , pairwise, startWith, switchMap, take, tap} from 'rxjs/operators';
import { combineLatest, Observable, of, Subject, Subscription, iif, from} from 'rxjs';

@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.scss']
})
export class ItemListComponent implements OnInit, AfterViewInit {
  @ViewChildren(ItemXComponent) items: QueryList<ItemXComponent>
  @Input() day: number;
  @Input() options: any
  @Input() axis;
  @Input() unit;
  @Input() id;
  @Input() timeUnits
  public allowedUnits = [];
  public currentItems;
  public color$ = this.service.colors$.pipe(map((el: string[])=> el[el.length * Math.random() | 0]));
  public skew = this.service.skew;

  childrenSize: Subscription
  public draggableElement;
  public isPlaceholder: boolean = false;
  public forbiddenIndexes$ = new Subject<number[][]>();
  public creatingTop = null;
  public resizeSub: Subscription;
  public creatingHeight = null;
  public isCreating = false;
  public itemHeight = this.service.itemHeight;
  @Output()
  dropping: EventEmitter<any> = new EventEmitter();

  constructor(public el:ElementRef, public service: ScheduleService, public cdRef: ChangeDetectorRef) { }

 ngOnInit(): void {
  this.service.placeholderDrop$.subscribe(()=> {
    setTimeout(()=> this.prepareForbiddenFieldsList(),2000);
  })


  interact(this.el.nativeElement)
    .dropzone(Object.assign({}, this.options || {}))
    // .on('dropactivate', event => event.target.classList.add('can-drop'))
    // .on('dragenter', event => {
    // })
    // .on('dragleave', event => {
    // })
    .on('drop', event => {
      if (ItemXComponent.counter < 4000) {
        event.relatedTarget.classList.add('animated');
      }
      
      const data = (window as any).dragData;
      // console.log('event', event),
      // console.log('draggedX', event.relatedTarget.offsetLeft),
      // console.log('draggedInX', event.target.offsetLeft)
      // console.log('draggedX + draggedInX',event.relatedTarget.offsetLeft + event.target.offsetLeft )
      // console.log('pageX', event.dragEvent.client.x)

      // console.log('pageX - draggedX + draggedInX', event.dragEvent.client.x - (event.relatedTarget.offsetLeft + event.target.offsetLeft))
      // console.log('roundedX',Math.round(event.relatedTarget.offsetLeft / this.unit))
      // console.log('allowedUnits', this.allowedUnits);
      const rounded = {
        start: Math.round(event.relatedTarget.offsetLeft / this.unit),
        end: Math.round((event.relatedTarget.offsetLeft + event.relatedTarget.clientWidth) / this.unit)
      }
      // console.log(JSON.parse(event.relatedTarget.dataset.model).current)
      from(this.allowedUnits).pipe(
        find((el)=> (rounded.start >= el[0] && rounded.end <= el[0] + el[1])),
      ).subscribe(
        (res) => {
          if (!res) {
            const model = {...(window as any).dragData, start: rounded.start * this.unit };
 
            event.relatedTarget.style.left = event.relatedTarget.dataset.originalLeft + 'px';
            event.relatedTarget.style.top = 0;
            event.relatedTarget.dataset.left = event.relatedTarget.dataset.originalLeft;
            event.relatedTarget.dataset.top = 0;
            setTimeout(()=> {

              this.service.changeTasks((window as any).dragData.current, (window as any).dragData.current,{...model, start: event.relatedTarget.dataset.originalLeft, id: this.service.getRandomString()});
              event.relatedTarget.classList.remove(['animated', 'top']);

            },300)
            return;
          }
          // event.relatedTarget.setAttribute('in-placeholder', true)
         
        const model = {...(window as any).dragData, start: rounded.start * this.unit };
     
        this.service.changeTasks((window as any).dragData.current, this.day, {...model, id: this.service.getRandomString()},);
        // event.relatedTarget.parentElement.removeChild(event.relatedTarget);
      
      }
      )

      this.prepareForbiddenFieldsList();
    })
    // .on('dropdeactivate', event => {

    // .on('mousedown', event => {

    // })

    // .on('mousemove', event => {

    // })

    // .on('mouseup', event => {
    // })
}

createComponent() {
}

reactToDrop(model: any) {
  this.service.changeTasks(model.current, this.day, model)
}

  ngAfterViewInit(): void {
    this.prepareForbiddenFieldsList();
    this.items.changes.pipe(tap((items)=> {

      this.prepareForbiddenFieldsList();
      this.currentItems = items;
      this.resizeSub && this.resizeSub.unsubscribe();
      this.resizeSub = combineLatest(this.items.map((item)=> item.resizeEnd$)).subscribe(
        () => {
          this.prepareForbiddenFieldsList();
        }
      )
    })).subscribe();

    this.resizeSub = combineLatest(this.items.map((item)=> item.resizeEnd$)).subscribe(
      () => {
        this.prepareForbiddenFieldsList();
      }
    )
  }

  identify(_index, item){
    return item.id
 }

 prepareForbiddenFieldsList(optional?) {
   
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
    this.forbiddenIndexes$.next(el);
    this.cdRef.detectChanges();
    } )
 }



 onItemDragStart(i) {
   this.service.deleteItem(i, this.day)
  //  this.prepareForbiddenFieldsList();
 }

 onFreeSpace(model) {
  this.prepareForbiddenFieldsList(model)
 }

 prepareAllowedIndexes(res) {
  if (!res) {
    this.allowedUnits = [[0, this.timeUnits]];
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
      allowedUnits.push([last, this.timeUnits-last] )
    }
    // return el[0] + el[1]
  })
  this.allowedUnits = allowedUnits
 }


}
