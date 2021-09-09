import { Component, ElementRef, HostListener, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-resizable-draggable',
  templateUrl: './resizable-draggable.component.html',
  styleUrls: ['./resizable-draggable.component.scss']
})
export class ResizableDraggableComponent implements OnInit {
  @Input('width') public width: number;
  @Input('height') public height: number;
  @Input('left') public left: number;
  @Input('top') public top: number;
  public boxSpec: any;
  public mouse: any;
  constructor(public box:ElementRef) { }

  ngOnInit(): void {
    const {left, top} = this.box.nativeElement.getBoundingClientRect();
this.boxSpec = {left, top};
  }
  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent){
    this.mouse = {
       x: event.clientX,
       y: event.clientY
    }
}
}
