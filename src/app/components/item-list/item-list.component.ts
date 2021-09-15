import { AfterViewInit, Component, ContentChildren, ElementRef, HostBinding, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { ScheduleService } from 'src/app/schedule.service';
import interact from 'interactjs';
import { EventEmitter } from '@angular/core';
import { ItemXComponent } from '../item-x/item-x.component';
import { ItemYComponent } from '../item-y/item-y.component';
import { map , switchMap, tap} from 'rxjs/operators';
import { combineLatest, Observable, Subject, Subscription} from 'rxjs';

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
  @Input() timeUnits
  public allowedUnits = []

  childrenSize: Subscription
  public draggableElement;
  public isPlaceholder: boolean = false;
  public forbiddenIndexes$ = new Subject<number[][]>();
  public creatingTop = null;
  public creatingHeight = null;
  public isCreating = false;
  @Output()
  dropping: EventEmitter<any> = new EventEmitter();

  constructor(public el:ElementRef, public service: ScheduleService) { }

  // @HostBinding('attr.colspan') value:number = this.el.nativeElement.children.length;

 ngOnInit(): void {

  interact(this.el.nativeElement)
    .dropzone(Object.assign({}, this.options || {}))
    .on('dropactivate', event => event.target.classList.add('can-drop'))
    .on('dragenter', event => {
      console.log(1)
      this.draggableElement = event.relatedTarget;
      const draggableElement = event.relatedTarget;
      const dropzoneElement = event.target;
      this.isPlaceholder = true;
      dropzoneElement.classList.add('can-catch');
      draggableElement.classList.add('drop-me');

    })
    .on('dragleave', event => {
      event.target.classList.remove('can-catch', 'caught-it');
      event.relatedTarget.classList.remove('drop-me');
      this.isPlaceholder = false;
    })
    .on('drop', event => {
      // console.log('drop')
      // console.log('drop1', event.target, event.relatedTarget)
      // event.relatedTarget.parentNode.removeChild(event.relatedTarget)
      // event.target.appendChild(event.relatedTarget)
      // event.relatedTarget.style.left = 0;
      // obj.style.left = 0;
      // event.target.appendChild(obj)
      this.isPlaceholder = false;
      const model = (window as any).dragData;
      if (this.axis === "y") {
        this.reactToDrop({...model, start:event.relatedTarget.style.top, range:event.relatedTarget.style.height })
      } else {

        this.reactToDrop({...model, start:Math.round(event.relatedTarget.offsetLeft / this.unit) * this.unit, range:event.relatedTarget.clientWidth })

      }
      

      if (typeof (model) === 'object') {
        this.dropping.emit(model);
      }
      event.target.classList.add('caught-it');

      if ((window as any).document.selection) {
        (window as any).document.selection.empty();
      } else {
        window.getSelection().removeAllRanges();
      }
    })
    .on('dropdeactivate', event => {
      event.target.classList.remove('can-drop');
      event.target.classList.remove('can-catch');
    })
    .on('mousedown', event => {
      if (event.originalTarget.parentElement.nodeName === "APP-ITEM-LIST") {
        this.isCreating = true;
        this.creatingTop= Math.round((event.pageY - this.unit)/this.unit) * this.unit
      }
    })

    .on('mousemove', event => {
      if (this.isCreating) {
        this.creatingHeight =  Math.round((event.pageY - this.creatingTop)/this.unit) * this.unit
       
      }

    })

    .on('mouseup', event => {
      if (this.isCreating) {
        this.service.addItem(this.creatingHeight,this.creatingTop, this.day)
        this.isCreating = false;
        this.creatingTop = null;
        this.creatingHeight=null;
      }
    
    })
}

createComponent() {
  
}

reactToDrop(model: any) {
  this.service.changeTasks(model.current, this.day, model)
}

  ngAfterViewInit(): void {
    this.prepareForbiddenFieldsList()
  }

  identify(index, item){
    return item.name; 
 }

 prepareForbiddenFieldsList() {
   
  this.items.changes.pipe(
    map(()=> this.items.map((item: ItemXComponent) => item.sizeChange$)),
    switchMap((items) => combineLatest(items)),
    tap((res)=> {
      let last = 0;
      let allowedUnits = [];
      const result = res.sort((a,b) => a[0]-b[0]);
      result.forEach((el, i)=> {
        const output = [last, el[0]-last];
        last = el[0] + el[1] 
        allowedUnits.push(output);
        if(i + 1 === res.length) {
          allowedUnits.push([last, this.timeUnits-last] )
        }
        // return el[0] + el[1]
      })
      this.allowedUnits = allowedUnits
    })
  ).subscribe((el)=> this.forbiddenIndexes$.next(el) )
 }
}
