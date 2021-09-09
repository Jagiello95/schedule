import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild, ViewChildren } from '@angular/core';
import interact from 'interactjs';
import { EventHelperService } from 'src/app/event-helper.service';
import { DragModel } from '../item.model';
@Component({
  selector: 'app-item-x',
  templateUrl: './item-x.component.html',
  styleUrls: ['./item-x.component.scss']
})
export class ItemXComponent implements OnInit, AfterViewInit {
  @Input() model: DragModel;

  
  @Input()
  unit;

  @Input()
  axis;


  @Input()
  options: any;

  @Output() 
  draggableClick = new EventEmitter();

  private currentlyDragged = false;

  constructor(public el: ElementRef, public helper: EventHelperService) {}

  @HostListener('click', ['$event'])
  public onClick(event: any): void {
    if (!this.currentlyDragged) {
      this.draggableClick.emit();
    }
  }

  ngAfterViewInit(): void {
    this.el.nativeElement.style.width = this.el.nativeElement.clientWidth;
  }

  ngOnInit(): void {
    (window as any).dragMoveListener = this.dragMoveListener.bind(this);
    (window as any).dragUnit= this.unit;

    this.initValues()

    interact(this.el.nativeElement)
    .resizable({
      edges: { top: false, left: true, bottom: false, right: true },
      axis: 'x',
      listeners: {
        move: function (event) {
          const client = (window as any);
          const unit = (window as any).dragUnit
          let { x, y } = event.target.dataset
          x = (parseFloat(x) || 0) + event.deltaRect.left
          y = (parseFloat(y) || 0) + event.deltaRect.top

          if (this.isLeftEdge(event)) {
            if (this.isResizeTowardsLeft(event)) {
             if (this.isCursorLeftFromDraggedEdge(event)) {
               if(this.isInsideLeftEdgeOfContainer(x)) {
                 this.handlePositiveResizeTowardsLeft(event, unit)
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

        if (this.isRightEdge(event)) {
          if (this.isResizeBeforeRightEdge(event)) {
            this.handlePositiveResizeTowardsRight(event)
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
      const element = event.target;
      element.dataset.model = this.model;
      (window as any).dragData = this.model;
    })

    .on('dragend', (event) => {
      event.target.style.top = 0;
      event.target.setAttribute('data-y', 0)
    })
}


public dragMoveListener(event) {
  var target = event.target
  // keep the dragged position in the data-x/data-y attributes
  var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
  var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy

  target.style.position = 'absolute';
  console.log(this.model)
  if (x >= 0) {
    if (x + target.clientWidth > target.parentElement.clientWidth) {

      target.style.left = target.parentElement.clientWidth - target.clientWidth + 'px'
    } else {
      target.style.left = Math.round(x/60) * 60 + 'px'
    }
  } else {
    target.style.left = 0
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

  public isCursorLeftFromDraggedEdge(event) {
    return this.helper.isCursorLeftFromDraggedEdge(event)
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

  public isResizeTowardsRight(event) {
    return this.helper.isResizeTowardsRight(event)
  }

  public handlePositiveResizeTowardsLeft(event, unit) {
    return this.helper.handlePositiveResizeTowardsLeft(event, unit)
  }

  public handleNegativeResizeTowardsRight(event, unit) {
    return this.helper.handleNegativeResizeTowardsRight(event, unit)
  }

  public handlePositiveResizeTowardsRight(event) {
    return this.helper.handlePositiveResizeTowardsRight(event)
  }

  public assignDatasetValues(event, x, y) {
    return this.helper.assignDatasetValues(event, x,y)
  }
}

