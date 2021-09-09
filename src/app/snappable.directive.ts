import {Directive, ElementRef, EventEmitter, HostListener, Input, OnInit, Output} from '@angular/core';
import interact from 'interactjs';

@Directive({
  selector: '[appSnappable]'
})
export class SnappableDirective implements OnInit {

  @Input()
  model: any;

  @Input()
  options: any;

  @Output() 
  draggableClick = new EventEmitter();

  private currentlyDragged = false;

  constructor(private element: ElementRef) {}

  @HostListener('click', ['$event'])
  public onClick(event: any): void {
    if (!this.currentlyDragged) {
      this.draggableClick.emit();
    }
  }

  ngOnInit(): void {
    (window as any).dragMoveListener = this.dragMoveListener
    const restrictToParent = interact.modifiers.restrict({
      restriction: 'parent',
      // elementRect: { left: 0, right: 0, top: 1, bottom: 1 },
    })
    let x = 0; 
    let y = 0;
    interact(this.element.nativeElement)
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
            width: `${event.rect.width}px`,
            height: `${event.rect.height}px`,
            // transform: `translate(${x}px, ${y}px)`
          })
  
          Object.assign(event.target.dataset, { x, y })
        }
      },
      modifiers: [
        interact.modifiers.snapSize({
          targets: [
            { width: 20 },
            interact.snappers.grid({ width: 20, height: 20 }),
          ],
        }),
        
        interact.modifiers.restrictRect({
          restriction: 'parent'
        })
      ],
    })
    .on(['resizestart', 'resizemove', 'resizeend'], this.showEventInfo)
    .draggable({
      listeners: { move: (window as any).dragMoveListener },
      inertia: true,
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
  target.style.top= y > 0 ? Math.round(y/20) * 20 + 'px' : 0;
  target.style.left= x > 0 ? Math.round(x/20) * 20 + 'px' : 0
  target.dataset.top = y > 0 ? Math.round(y/15) * 15 : 0
  target.style.width= '20rem'

  // update the posiion attributes
  target.setAttribute('data-x', x)
  target.setAttribute('data-y', y)
}

public showEventInfo($event) {

}

// this function is used later in the resizing and gesture demos
public timeConvert(n) {
  var num = n;
  var hours = (num / 60);
  var rhours = Math.floor(hours);
  var minutes = (hours - rhours) * 60;
  var rminutes = Math.round(minutes);
  return rhours + '.' + rminutes;
  }

}