import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild, ViewChildren } from '@angular/core';
import interact from 'interactjs';
import { EventHelperService } from 'src/app/event-helper.service';
import { DragModel } from '../item.model';
import { BehaviorSubject, forkJoin, Observable, Subject, combineLatest, zip} from 'rxjs'
import {distinctUntilChanged, map} from 'rxjs/operators';
import { CombineLatestOperator } from 'rxjs/internal/observable/combineLatest';
import { ScheduleService } from 'src/app/schedule.service';
@Component({
  selector: 'app-item-x',
  templateUrl: './item-x.component.html',
  styleUrls: ['./item-x.component.scss']
})
export class ItemXComponent implements OnInit, AfterViewInit {
  public range;
  public start;
  public rangeChange$: BehaviorSubject<number>;
  public startChange$: BehaviorSubject<number>;
  @Input() public index;
  @Input() public parentId;
  @Output() public dragStartEvent = new EventEmitter<number>();
  @Output() public dragEndEvent = new EventEmitter<any>();
  public dragEnd$: Observable<number[]>;
  public resizeEnd$: Subject<void>;
  public closestRight;
  public closestLeft;
  public clone;
  public originalParent;
  
  public sizeChange$: Observable<number[]>
  @Input() model: DragModel;

  @Input() parentWidth;
  @Input()
  unit;

  @Input()
  axis;

  @Input()
  forbiddenIndexes$;

  public forbiddenIndexes;

  @Input()
  options: any;

  @Output() 
  draggableClick = new EventEmitter();

  private currentlyDragged = false;

  constructor(public el: ElementRef, public helper: EventHelperService, private cdRef : ChangeDetectorRef, private scheduleService: ScheduleService) {}

  @HostListener('click', ['$event'])
  public onClick(event: any): void {
    if (!this.currentlyDragged) {
      this.draggableClick.emit();
    }
  }

  ngAfterViewInit(): void {
    this.el.nativeElement.style.width = this.el.nativeElement.clientWidth;
    this.el.nativeElement.style.left= this.model.start + 'px';
    
    
  }

  ngOnInit(): void {
    (window as any).dragMoveListener = this.dragMoveListener.bind(this);
    (window as any).dragUnit= this.unit;
    this.resizeEnd$ = new Subject<void>();
    this.rangeChange$ = new BehaviorSubject<number>(this.model.range);
    this.forbiddenIndexes$.subscribe((forbiddenIndexes: number[][]) => {
      this.forbiddenIndexes = forbiddenIndexes;
      this.closestRight = this.getClosestRight(this.forbiddenIndexes?.map(el => el[0]), (this.start + this.range)/this.unit);
      this.closestLeft = this.getClosestLeft(this.forbiddenIndexes?.map(el => el[0] + el[1]), (this.start)/this.unit);
           this.cdRef.detectChanges();
    })

    this.rangeChange$.subscribe((width: number)=> {
      this.range = Math.round(width / this.unit) * this.unit
      this.el.nativeElement.style.width = width + 'px';
    })
  
    this.startChange$ = new BehaviorSubject<number>(this.model.start)
    this.startChange$.subscribe((left: number)=> {
      this.start = Math.round(left / this.unit) * this.unit
      this.el.nativeElement.style.left = left + 'px';
    })

    this.sizeChange$ = combineLatest([
      this.startChange$.pipe(distinctUntilChanged(),map((el)=> el / this.unit)),
      this.rangeChange$.pipe(distinctUntilChanged(),map((el)=> el / this.unit)), 
    ])
    // this.sizeChange$.subscribe(console.log)
    this.initValues()

    interact(this.el.nativeElement)
    .resizable({
      edges: { top: false, left: true, bottom: false, right: true },
      axis: 'x',
      listeners: {
        move: function (event) {
          console.log(1)
          const client = (window as any);
          const unit = (window as any).dragUnit
          let { x, y } = event.target.dataset
          x = (parseFloat(x) || 0) + event.deltaRect.left
          y = (parseFloat(y) || 0) + event.deltaRect.top
          
          if (this.isLeftEdge(event)) {
            if (this.isResizeTowardsLeft(event)) {
             if (this.isCursorLeftFromLeftEdge(event)) {
               if(this.isInsideLeftEdgeOfContainer(x)) {
                if(this.isMoreThanEdgeLeft(event)) {
                 this.handlePositiveResizeTowardsLeft(event, unit)
                }
                }
              }
            }
            
            if (this.isMovedByUnit(event, unit)) {
              if (this.isBeingResizedBelowZero(event, unit)) {
                return;
              }

              if (this.isResizeTowardsRight(event)) {
                this.handleNegativeResizeTowardsRight(event, unit)
              }
            }
          Object.assign(event.target.dataset, { x: event.target.offsetLeft, y })

          return;
          
        }

        if(this.isRightEdge(event)) {
          if (this.isResizeTowardsLeft(event)) {
            if (this.isCursorLeftFromRightEdge(event)) {
  
                if (this.isBeingResizedBelowZero(event, unit)) {
                  return;
                }
                this.handleNegativeResizeTowardsLeft(event, unit)
              }
              
            }
          }

          if (this.isResizeTowardsRight(event)) {
            if (this.isCursorRightFromRightEdge(event)) {
              if (this.isLessThanEdgeRight(event)) {
                if (this.isBeingResizedOverParentWidth(event, unit)) {
                  return;
                }
                  this.handlePositiveResizeTowardsRight(event, unit)
              }
          }
        }
        this.assignDatasetValues(event, x,y)
 
        }.bind(this)
         
      },
      modifiers: [
        interact.modifiers.snapSize({
          targets: [
            { width: this.unit },
            interact.snappers.grid({ width: this.unit, height: this.unit }),
          ],
        }),
      ],
    })

    .on(['resizestart', 'resizemove', 'resizeend'], (event) => {
      this.model = {...this.model, range: this.el.nativeElement.style.width}
    })
    .draggable({
      listeners: { move: (window as any).dragMoveListener },
      // inertia: true,
    })
    .on('dragstart', (event) => {
      this.dragStartEvent.emit();
      const element = event.target;
      element.dataset.model = this.model;
      (window as any).dragData = this.model;
      // const interaction = event.interaction;
      // if (event.currentTarget.getAttribute('clonable') != 'false') {
      //   var original = event.currentTarget;
      //   this.clone = event.currentTarget.cloneNode(true);
      //   var x = this.clone.offsetLeft;
      //   var y = this.clone.offsetTop;
      //   this.clone.setAttribute('clonable','false');
      //   this.clone.style.position = "absolute";
      //   this.clone.style.left = original.offsetLeft +"px";
      //   this.clone.style.height = original.clientHeight + "px"
      //   this.clone.style.width = original.clientWidth + "px"
      //   this.clone.style.top = original.offsetTop +"px";
      //   this.clone.model = this.model;
      //   this.originalParent = document.body
      //   original.parentElement.appendChild(this.clone);
      //   interaction.start({ name: 'drag' },event.interactable,this.clone);
      // }

  

    })
    .on('resizeend', (event) => {
      this.resizeEnd$.next()
    })
    .on('dragend', (event) => {
      this.dragEndEvent.emit(1234567890)
      event.target.style.top = 0;
      event.target.setAttribute('data-y', 0);
      this.dragEnd$ = combineLatest([
        this.startChange$.pipe(distinctUntilChanged(),map((el)=> el / this.unit)),
        this.rangeChange$.pipe(distinctUntilChanged(),map((el)=> el / this.unit)), 
      ])


      // this.originalParent.removeChild(this.clone);

    })
}


public dragMoveListener(event) {
  var target = event.target
  // keep the dragged position in the data-x/data-y attributes
  var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
  var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy

  // target.style.position = 'absolute';
  if (this.clone) {
    this.clone.style.left = x + 'px' ;
    this.clone.dataset.left = x > 0 ? Math.round(x/15) * 15 : 0
    this.clone.style.top = y  +"px";
  }

  if (x >= 0) {
    if (x + target?.clientWidth > target?.parentElement?.clientWidth) {
  
      this.startChange$.next(target.parentElement.clientWidth - target.clientWidth)
    } else {
      // this.startChange$.next(Math.round(x/this.unit) * this.unit)
      this.startChange$.next(x)
    }
  } else {
    this.startChange$.next(0)
  }
  

  target.style.top= y + 'px'
  target.dataset.left = x > 0 ? Math.round(x/15) * 15 : 0

  // update the posiion attributes
  target.setAttribute('data-x', x)
  target.setAttribute('data-y', y)
}

public showEventInfo($event) {
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

  public initValues() {
    this.el.nativeElement.style.left = !isNaN(this.model.start) ? `${this.model.start}px` : this.model.start;
    this.el.nativeElement.style.width = !isNaN(this.model.range) ? `${this.model.range}px` : this.model.range;
    this.el.nativeElement.setAttribute('data-x', this.model.start)
  }

  public isLeftEdge(event) {
    return this.helper.isLeftEdge(event)
  }

  public isRightEdge(event) {
    return this.helper.isRightEdge(event)
  }

  public isResizeBeforeRightEdge(event) {
    return this.helper.isResizeBeforeRightEdge(event);
  }

  public isResizeTowardsLeft(event) {
    return this.helper.isResizeTowardsLeft(event);
  }

  public isResizeTowardsRight(event) {
    return this.helper.isResizeTowardsRight(event)
  }

  public isCursorLeftFromLeftEdge(event) {
    return this.helper.isCursorLeftFromLeftEdge(event)
  }

  public isCursorLeftFromRightEdge(event) {
    return this.helper.isCursorLeftFromRightEdge(event)
  }

  public isCursorRightFromRightEdge(event) {
    return this.helper.isCursorRightFromRightEdge(event)
  }

  public isInsideLeftEdgeOfContainer(param) {
    return this.helper.isInsideLeftEdgeOfContainer(param)
  }

  public isMovedByUnit(event, unit) {
    return this.helper.isMovedByUnit(event, unit) 
  }

  public isBeingResizedBelowZero(event, unit) {
    return this.helper.isBeingResizedBelowZero(event, unit) 
  }

  public isBeingResizedOverParentWidth(event, unit) {
    return this.helper.isBeingResizedOverParentWidth(event, unit) 
  }

  public isMoreThanEdgeLeft(event) {
    return event.target.offsetLeft / this.unit > this.closestLeft
  }

  
  public isLessThanEdgeRight(event) {
    return ((event.target.offsetLeft + event.target.clientWidth) / this.unit)  < this.closestRight
  }




  public isAvailable(index: number) {
    return true;
    return this.helper.isAvailable(index, this.forbiddenIndexes)
  }

  public handlePositiveResizeTowardsLeft(event, unit) {
    // if (!this.isAvailable((event.target.offsetLeft - unit) / unit)) {
    //   return;
    // }
    // console.log('can move left:', this.isAvailable((event.target.offsetLeft - unit) / unit), event.target.offsetLeft - unit)

    if (!this.isAvailable((event.target.offsetLeft - unit) / unit)) {
      return;
    }
    this.startChange$.next(event.target.offsetLeft - unit)
    this.rangeChange$.next(event.target.clientWidth + unit)
  }

  public handleNegativeResizeTowardsRight(event, unit ) {
    this.startChange$.next(event.target.offsetLeft + unit)
    this.rangeChange$.next(event.target.clientWidth - unit)
  }

  public handlePositiveResizeTowardsRight(event, unit) {
    if (!this.isAvailable(((event.target.offsetLeft + event.target.clientWidth + this.unit) - unit) / unit)) {
      return;
    }
    this.rangeChange$.next(event.target.clientWidth + unit)
    // this.rangeChange$.next(event.rect.width)
    // event.target.style.height = '5rem'
  }

  public handleNegativeResizeTowardsLeft(event, unit) {
    this.rangeChange$.next(event.target.clientWidth - unit)
    // console.log('hello')
  }

  public assignDatasetValues(event, x, y) {
    return this.helper.assignDatasetValues(event, x,y)
  }

  public getClosestRight(arr, i) {
const data = arr?.filter((el)=> el >= i)
var closest = data?.length ? data.reduce(function(prev, curr) {
  return (Math.abs(curr - i) < Math.abs(prev - i) ? curr : prev);
}) : this.parentWidth;

return closest;
  }

  public getClosestLeft(arr, i) {
    const data = arr?.filter((el)=> el <= i)
    var closest = data?.length ? data.reduce(function(prev, curr) {
      return (Math.abs(curr - i) < Math.abs(prev - i) ? curr : prev);
    }) : 0;
    
    return closest;
      }
}

