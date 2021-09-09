import {Directive, ElementRef, EventEmitter, HostListener, Input, OnInit, Output} from '@angular/core';
import interact from 'interactjs';

@Directive({
  selector: '[appDraggable]'
})
export class DraggableDirective implements OnInit {

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
    interact(this.element.nativeElement)
      .draggable(Object.assign({}, {
        modifiers: [
          interact.modifiers.snap({
            targets: [ { x: 3000, y: 3000 } ],
            relativePoints: [
              { x: 0  , y: 0   },   // snap relative to the element's top-left,
              { x: 0.5, y: 0.5 },   // to the center
              { x: 1  , y: 1   }    // and to the bottom-right
            ]
          } || {})
        ]
      }))
      .on('dragmove', (event) => {
        const target = event.target;
        const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
        const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

        target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);

        target.classList.add('getting-dragged');
        this.currentlyDragged = true;
        (window as any).dragData = this.model;
      })
      .on('dragend', (event) => {
        event.target.style.transform = 'none';
        event.target.removeAttribute('data-x');
        event.target.removeAttribute('data-y');

        event.target.classList.remove('getting-dragged');
        setTimeout(() => {
          (window as any).dragData = null;
          this.currentlyDragged = false;
        });
      });
  }
}