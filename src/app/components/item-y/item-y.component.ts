import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild, ViewChildren } from '@angular/core';
import interact from 'interactjs';
import { DragModel } from '../item.model';
@Component({
  selector: 'app-item-y',
  templateUrl: './item-y.component.html',
  styleUrls: ['./item-y.component.scss']
})
export class ItemYComponent implements OnInit, AfterViewInit {
  @Input()
  model: DragModel;
  
  @Input()
  unit: number;

  @Input()
  axis: string;


  @Input()
  options: any;

  @Output() 
  draggableClick = new EventEmitter();

  private currentlyDragged = false;

  constructor(public el: ElementRef) {}

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
    (window as any).dragMoveListener = this.dragMoveListener;
    (window as any).dragUnit= this.unit
    const restrictToParent = interact.modifiers.restrict({
      restriction: 'parent',
      // elementRect: { left: 0, right: 0, top: 1, bottom: 1 },
    })
    let x = 0; 
    let y = 0;
    this.el.nativeElement.style.top = !isNaN(this.model.start) ? `${this.model.start}px` : this.model.start;
    this.el.nativeElement.style.height = !isNaN(this.model.range) ? `${this.model.range}px` : this.model.range;
    this.el.nativeElement.setAttribute('data-y', this.model.start)
    interact(this.el.nativeElement)
    // .draggable({
    //   modifiers: [
    //     interact.modifiers.snap({
    //       targets: [
    //         interact.snappers.grid({ x: 100, y: 100 })
    //       ],
    //       range: Infinity,
    //       // relativePoints: [ { x: 0, y: 0 } ]
    //     }),
    //     interact.modifiers.restrict({
    //       restriction: 'parent',
    //       // elementRect: { left: 0, right: 0, top: 1, bottom: 1 },
    //       // endOnly: true
    //     }),
    //     // interact.modifiers.restrictSize({
    //     //   min: { width: 100, height: 100 },
    //     //   max: { width: 500, height: 500 }
    //     // })
    //   ],
    //   inertia: true
    // })
    .resizable({
      edges: { top: false, left: false, bottom: true, right: false },
      axis: 'y',
      listeners: {
        move: function (event) {
          let { x, y } = event.target.dataset
  
          x = (parseFloat(x) || 0) + event.deltaRect.left
          y = (parseFloat(y) || 0) + event.deltaRect.top
  
          Object.assign(event.target.style, {
            width: `100%`,
            height: `${event.rect.height}px`,
            // transform: `translate(${x}px, ${y}px)`
          })
  
          Object.assign(event.target.dataset, { x, y })
        }
      },
      modifiers: [
        interact.modifiers.snapSize({
          targets: [
            { width: this.unit },
            interact.snappers.grid({ width: this.unit, height: this.unit }),
          ],
        }),
        
        // interact.modifiers.restrictRect({
        //   restriction: 'parent'
        // })
      ],
    })
    .on(['resizestart', 'resizemove', 'resizeend'], (event) => {
      this.model = {...this.model, range: this.el.nativeElement.style.height}
    })
    .draggable({
      listeners: { move: (window as any).dragMoveListener },
      // inertia: true,
      modifiers: [
        // interact.modifiers.restrictRect({
        //   restriction: 'parent',
        //   endOnly: true
        // }),
        // interact.modifiers.snap({
        //         targets: [
        //           interact.snappers.grid({ x: 10, y: 100 })
        //         ],
        //         range: Infinity,
        //         // relativePoints: [ { x: 0, y: 0 } ]
        //       }),
      ]
    })
    .on('dragstart', (event) => {
      const element = event.target;
      element.dataset.model = this.model;
      (window as any).dragData = this.model;
    })


    .on('dragend', (event) => {
      // event.target.style.left = 0;
      // const element = event.target;
      event.target.style.left = 0;
      event.target.setAttribute('data-x', 0)
      // (window as any).dragData = this.model;
    })
    // .on('dragmove', function (event) {
    //   x += event.dx
    //   y += event.dy
  
    //   event.target.style.transform = 'translate(' + x + 'px, ' + y + 'px)'
    // })

}


public dragMoveListener(event) {
  var target = event.target
  // keep the dragged position in the data-x/data-y attributes
  var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
  var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy

  // translate the element
  target.style.position = 'absolute';
  target.style.top= y > 0 ? Math.round(y/(window as any).dragUnit) * (window as any).dragUnit + 'px' : 0;
  // target.style.left= x > 0 ? Math.round(x/20) * 20 + 'px' : 0
  // target.style.left= Math.round(x/20) * 20 + 'px'
  target.style.left= x + 'px'

  target.dataset.top = y > 0 ? Math.round(y/15) * 15 : 0
  // target.dataset.parentContainer = this.model.current;
  // target.style.width= '20rem'

  // update the posiion attributes
  target.setAttribute('data-x', x)
  target.setAttribute('data-y', y)
}

public showEventInfo($event) {
}

// this function is used later in the resizing and gesture demos
public timeConvert(n) {
  n = !isNaN(n) ? n : +n.substring(0, n.length-2)
  var num = 0.75 * n;
  var hours = (num / 60);
  var rhours = Math.floor(hours);
  var minutes = (hours - rhours) * 60;
  var rminutes = Math.round(minutes);
  return rhours + '.' + rminutes;
  }

}
