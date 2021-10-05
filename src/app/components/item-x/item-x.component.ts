import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import interact from 'interactjs';
import { EventHelperService } from 'src/app/event-helper.service';
import { DragModel } from '../item.model';
import { BehaviorSubject, Observable, Subject, combineLatest, Subscription} from 'rxjs'
import {distinctUntilChanged, map} from 'rxjs/operators';
import { ScheduleService } from 'src/app/schedule.service';
@Component({
  selector: 'app-item-x',
  templateUrl: './item-x.component.html',
  styleUrls: ['./item-x.component.scss']
})
export class ItemXComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() public parentId: number;
  @Input() public model: DragModel;
  @Input() private forbiddenIndexes$: Observable<number[][]>;

  @Input() set index(index: number) {
    this.model.index = index
  }

  @Output() public dragEndEvent = new EventEmitter<any>();
  @Output() public draggableClick = new EventEmitter();
  @Output() public freeSpace = new EventEmitter();


  static counter = 0;
  public unit = this.scheduleService.unit;
  public parentWidth = this.scheduleService.rowsAmount;
  public itemHeight = this.scheduleService.itemHeight;
  public skew = this.scheduleService.skew;
  public shiftRight = this.scheduleService.shiftRight;
  public currentlyDragged = false;

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

  public ngOnInit(): void {
    this.assignGlobalVars();
    this.assignSubjects();
    this.assignSubscriptions();
    this.assignObservables();
    this.initValues()
    this.assignInteractionEvents();
  }

  public ngAfterViewInit(): void {
    this.assignItemInitStyle();
  }

  public ngOnDestroy(): void {
    this.resolveSubscriptions();
  }

  public dragMoveListener(event) {
    const target = event.target;
    const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
    const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy
  ;
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
    return this.helper.isResizeTowardsLeft(event, this.unit);
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
    return this.helper.isInsideLeftEdgeOfContainer(param, this.unit)
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
    return this.helper.isMoreThanEdgeLeft(event, this.unit, this.closestLeft)
  }

  public isLessThanEdgeRight(event) {
    return this.helper.isLessThanEdgeRight(event, this.unit, this.closestRight)
  }

  public handlePositiveResizeTowardsLeft(event, unit) {
    this.startChange$.next(event.target.offsetLeft - unit)
    this.rangeChange$.next(event.target.clientWidth + unit)
  }

  public handleNegativeResizeTowardsRight(event, unit ) {
    this.startChange$.next(event.target.offsetLeft + unit)
    this.rangeChange$.next(event.target.clientWidth - unit)
  }

  public handlePositiveResizeTowardsRight(event, unit) {
    this.rangeChange$.next(event.target.clientWidth + unit)
  }

  public handleNegativeResizeTowardsLeft(event, unit) {
    this.rangeChange$.next(event.target.clientWidth - unit)
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

  public assignItemInitStyle() {
    this.el.nativeElement.style.width = this.el.nativeElement.clientWidth;
    this.el.nativeElement.style.left = this.model.start + 'px';
    const skew = this.skew && `skew(-${this.skew}deg)`
    const shift = this.shiftRight && `translateX(${this.shiftRight}px)`;
    if (skew && shift) {
      this.el.nativeElement.style.transform = skew.concat(' ',shift);
      this.el.nativeElement.firstChild.style.transform = `skew(${this.skew}deg)`
    }
    else if (skew) {
      this.el.nativeElement.style.transform = skew;
      this.el.nativeElement.firstChild.style.transform = `skew(${this.skew}deg)`
    }
    else if (shift) {
      this.el.nativeElement.style.transform = shift
    }
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
    })

    .on(['resizeend'], () => {
      this.model = {...this.model, range: this.el.nativeElement.clientWidth}
    })
    .draggable({
      listeners: { move: (window as any).dragMoveListener},
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

