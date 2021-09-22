import { Component, ElementRef, HostBinding, Input, OnInit, ViewChild } from '@angular/core';
import interact from 'interactjs';
import { Subject } from 'rxjs';
import { ScheduleService } from 'src/app/schedule.service';

@Component({
  selector: '[app-placeholder]',
  templateUrl: './placeholder.component.html',
  styleUrls: ['./placeholder.component.scss']
})
export class PlaceholderComponent implements OnInit {
  @ViewChild('ph') placeholder;
  public draggableElement;
  public dragEntered = false;
  public itemDropped$ = new Subject<void>();
  private _width: number;
  private _left: number;
  private test = false;
  @Input() set width(width: number) {
    this._width = width
  }

  @Input() day
  
  @Input() unit


  get width() {
    return this._width
  }


  @Input() set left(left: number) {
    this._left = left
  }

  get left() {
    return this._left
  }

  constructor(public el: ElementRef, public scheduleService: ScheduleService) { }

  ngOnInit(): void {
    interact.dynamicDrop(true),
    // setTimeout( () => interact.dynamicDrop(false),1000)
    interact(this.el.nativeElement)

    .dropzone(Object.assign({}, {} || {}))
    .on('dropactivate', event => event.target.classList.add('can-drop'))
    .on('dragenter', event => {
      this.dragEntered = true;
      const draggableElement = event.relatedTarget;
      // console.log(draggableElement)
      this.draggableElement = draggableElement;
      const dropzoneElement = event.target;
      dropzoneElement.classList.add('can-catch');
      draggableElement.classList.add('drop-me');


    })
    .on('dragleave', event => {

      this.dragEntered = false;
      event.target.classList.remove('can-catch', 'caught-it');
      event.relatedTarget.classList.remove('drop-me');
    })
    .on('drop', event => {
      const model = (window as any).dragData;

      this.dragEntered = false;
      if (this.placeholder) {
        event.relatedTarget.setAttribute('in-placeholder', true)
      this.scheduleService.placeholderDrop$.next();
        const left =  this.placeholder.nativeElement.offsetLeft + this.el.nativeElement.offsetLeft;
        const width = this.placeholder.nativeElement.clientWidth;
        const oldLeft = event.relatedTarget.offsetLeft;
        const oldWidth = Math.round(event.relatedTarget.clientWidth / this.unit) * this.unit
        this.reactToDrop({...model, start: left, range:width })
        event.relatedTarget.parentElement.removeChild(event.relatedTarget)

      }
 
    })
    .on('dropdeactivate', event => {
      event.target.classList.remove('can-drop');
      event.target.classList.remove('can-catch');
    })
    .on('mousedown', event => {

    })

    .on('mousemove', event => {
    

    })

    .on('mouseup', event => {

      })
}
reactToDrop(model: any) {
  this.scheduleService.changeTasks(model.current, this.day, model);
  this.itemDropped$.next()
  
}

}
