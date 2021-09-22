import { AfterViewInit, ChangeDetectorRef, Component, ContentChildren, ElementRef, HostBinding, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { ScheduleService } from 'src/app/schedule.service';
import interact from 'interactjs';
import { EventEmitter } from '@angular/core';
import { ItemXComponent } from '../item-x/item-x.component';
import { ItemYComponent } from '../item-y/item-y.component';
import { map , startWith, switchMap, take, tap} from 'rxjs/operators';
import { combineLatest, Observable, of, Subject, Subscription, iif} from 'rxjs';

@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.scss']
})
export class ItemListComponent implements OnInit, AfterViewInit {
  @ViewChildren(ItemXComponent) items: QueryList<ItemXComponent>
  // @ContentChildren(ItemComponent) citems: QueryList<ItemComponent>
  @Input() day: number;

  @Input()
  options: any
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
  public creatingHeight = null;
  public isCreating = false;
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
      // event.target.classList.remove('can-catch', 'caught-it');
      // event.relatedTarget.classList.remove('drop-me');
      // this.isPlaceholder = false;
    // })
    .on('drop', event => {
      this.prepareForbiddenFieldsList()
      // this.isPlaceholder = false;
      // const model = (window as any).dragData;
  
      // if (typeof (model) === 'object') {
        // this.dropping.emit(model);
      // }
      // event.target.classList.add('caught-it');

      // if ((window as any).document.selection) {
      //   (window as any).document.selection.empty();
      // } else {
      //   window.getSelection().removeAllRanges();
      // }
    })
    // .on('dropdeactivate', event => {
      // event.target.classList.remove('can-drop');
      // event.target.classList.remove('can-catch');
    // })
    // .on('mousedown', event => {
      // if (event.originalTarget.parentElement.nodeName === "APP-ITEM-LIST") {
      //   this.isCreating = true;
      //   this.creatingTop= Math.round((event.pageY - this.unit)/this.unit) * this.unit
      // }
    // })

    // .on('mousemove', event => {
      // if (this.isCreating) {
      //   this.creatingHeight =  Math.round((event.pageY - this.creatingTop)/this.unit) * this.unit
      // }

    // })

    // .on('mouseup', event => {
      // if (this.isCreating) {
      //   this.service.addItem(this.creatingHeight,this.creatingTop, this.day)
      //   this.isCreating = false;
      //   this.creatingTop = null;
      //   this.creatingHeight=null;
      // }
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

      combineLatest(this.items.map((item)=> item.resizeEnd$)).subscribe(
        () => {
          this.prepareForbiddenFieldsList();
        }
      )
    })).subscribe();

    combineLatest(this.items.map((item)=> item.resizeEnd$)).subscribe(
      () => {
        this.prepareForbiddenFieldsList();
      }
    )
  }

  identify(index, item){
    // console.log(item)
    return item.name
 }

 prepareForbiddenFieldsList() {
   
  of(true).pipe(
    map(() => this.items.map((item: ItemXComponent) => item.sizeChange$)),
    switchMap((items) => 
    iif(() => !!items.length
    , combineLatest(items)
    , of(null)
 )),
    tap((res)=> {
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
    }),
    take(1),
    map((arr => arr?.map((el)=> [Math.round((el[0] / this.unit) * this.unit), Math.round((el[1] / this.unit) * this.unit)])))
  ).subscribe((el)=> {
    this.forbiddenIndexes$.next(el);
    this.cdRef.detectChanges();
    } )
 }

 onItemDragEnd(event) {
}

 onItemDragStart(i) {
   this.service.deleteItem(i, this.day)
  //  this.prepareForbiddenFieldsList();
 }


}
