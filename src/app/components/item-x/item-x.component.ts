import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild, ViewChildren } from '@angular/core';
import interact from 'interactjs';
import { EventHelperService } from 'src/app/event-helper.service';
import { DragModel } from '../item.model';
import { BehaviorSubject, forkJoin, Observable, Subject, combineLatest, zip, Subscription} from 'rxjs'
import {distinctUntilChanged, map} from 'rxjs/operators';
import { CombineLatestOperator } from 'rxjs/internal/observable/combineLatest';
import { ScheduleService } from 'src/app/schedule.service';
@Component({
  selector: 'app-item-x',
  templateUrl: './item-x.component.html',
  styleUrls: ['./item-x.component.scss']
})
export class ItemXComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() public parentId: number;
  @Input() public model: DragModel;
  @Input() public parentWidth: number;
  @Input() public unit: number;
  @Input() private forbiddenIndexes$: Observable<number[][]>;

  @Input() set index(index: number) {
    this.model.index = index
  }

  @Output() public dragStartEvent = new EventEmitter<number>();
  @Output() public dragEndEvent = new EventEmitter<any>();
  @Output() public draggableClick = new EventEmitter();
  @Output() public freeSpace = new EventEmitter();


  static counter = 0;

  public range: number;
  public start: number;

  public rangeChange$: BehaviorSubject<number>;
  public startChange$: BehaviorSubject<number>;
  public resizeEnd$: Subject<void>;

  public sizeChange$: Observable<number[]>

  public forbiddenIndexesSub: Subscription;
  public sizeChangeSub: Subscription;
  public startChangeSub: Subscription;
  public rangeChangeSub: Subscription;

  public closestRight: number;
  public closestLeft: number;

  public forbiddenIndexes: number[][];
  public itemHeight = this.scheduleService.itemHeight;

  public currentlyDragged = false;

  constructor(
    public el: ElementRef,
    public helper: EventHelperService,
    private cdRef : ChangeDetectorRef,
    private scheduleService: ScheduleService) {
    ItemXComponent.counter++;
  }

  @HostListener('click', ['$event'])
  public onClick(): void {
    if (!this.currentlyDragged) {
      this.draggableClick.emit();
    }
  }

  ngAfterViewInit(): void {
    this.el.nativeElement.style.width = this.el.nativeElement.clientWidth;
    this.el.nativeElement.style.left = this.model.start + 'px';
  }

  ngOnDestroy(): void {
    this.resolveSubscriptions();
  }

  ngOnInit(): void {
    this.assignGlobalVars();
    this.assignSubjects();
    this.assignSubscriptions();
    this.assignObservables();
    this.initValues()
    this.assignInteractionEvents();
  }


public dragMoveListener(event) {
  var target = event.target
  // keep the dragged position in the data-x/data-y attributes
  var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
  var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy

  if ( x >= 0) {
    if (x + target?.clientWidth > target?.parentElement?.clientWidth) {
      this.startChange$.next(target.parentElement.clientWidth - target.clientWidth)
    } else {
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

  public isBeingResizedBelowUnit(event, unit) {
    return this.helper.isBeingResizedBelowUnit(event, unit) 
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

  public assignGlobalVars() {
    (window as any).dragMoveListener = this.dragMoveListener.bind(this);
    (window as any).dragUnit= this.unit;
  }

  public assignSubjects() {
    this.resizeEnd$ = new Subject<void>();
    this.rangeChange$ = new BehaviorSubject<number>(this.model.range);
    this.startChange$ = new BehaviorSubject<number>(this.model.start);
  }

  public assignObservables() {
    this.sizeChange$ = combineLatest([
      this.startChange$.pipe(distinctUntilChanged(),map((el)=> el / this.unit)),
      this.rangeChange$.pipe(distinctUntilChanged(),map((el)=> el / this.unit)), 
    ])
  }

  public assignSubscriptions() {
    this.forbiddenIndexesSub = this.forbiddenIndexes$.subscribe((forbiddenIndexes: number[][]) => {
      this.forbiddenIndexes = forbiddenIndexes;
      this.closestRight = this.getClosestRight(this.forbiddenIndexes?.map(el => el[0]), (this.start + this.range)/this.unit);
      this.closestLeft = this.getClosestLeft(this.forbiddenIndexes?.map(el => el[0] + el[1]), (this.start)/this.unit);
      this.cdRef.detectChanges();
    })

    this.rangeChangeSub = this.rangeChange$.subscribe((width: number)=> {
      this.range = Math.round(width / this.unit) * this.unit
      this.el.nativeElement.style.width = width + 'px';
    })
  

    this.startChangeSub = this.startChange$.subscribe((left: number)=> {
      this.start = Math.round(left / this.unit) * this.unit
      this.el.nativeElement.style.left = left + 'px';
    })
  }

  public resolveSubscriptions() {
    this.startChangeSub && this.startChangeSub.unsubscribe();
    this.rangeChangeSub && this.rangeChangeSub.unsubscribe();
    this.sizeChangeSub && this.sizeChangeSub.unsubscribe();
  }

  public assignInteractionEvents() {
    interact(this.el.nativeElement)
    .resizable({
      edges: { top: false, left: true, bottom: false, right: true },
      axis: 'x',
      listeners: {
        move: function (event) {

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
              if (this.isBeingResizedBelowUnit(event, unit)) {
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
  
                if (this.isBeingResizedBelowUnit(event, unit)) {
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
      // modifiers: [
      //   interact.modifiers.snapSize({
      //     targets: [
      //       { width: this.unit },
      //       interact.snappers.grid({ width: this.unit, height: this.unit }),
      //     ],
      //   }),
      // ],
    })

    .on(['resizeend'], (event) => {
      this.model = {...this.model, range: this.el.nativeElement.clientWidth}
    })
    .draggable({
      listeners: { move: (window as any).dragMoveListener },
      // inertia: true,
    })
    .on('dragstart', (event) => {

      
      const element = event.target;
      element.dataset.model = this.model;
      element.dataset.originalLeft = this.el.nativeElement.offsetLeft;
      this.el.nativeElement.classList.add('top');
      this.freeSpace.emit(this.model);
      (window as any).dragData = this.model;
    })
    .on('resizeend', (event) => {
      this.resizeEnd$.next()
    });
  }
}

