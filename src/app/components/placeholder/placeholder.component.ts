import { Component, ElementRef, HostBinding, Input, OnInit } from '@angular/core';
import interact from 'interactjs';
import { Subject } from 'rxjs';
import { ScheduleService } from 'src/app/schedule.service';

@Component({
  selector: '[app-placeholder]',
  templateUrl: './placeholder.component.html',
  styleUrls: ['./placeholder.component.scss']
})
export class PlaceholderComponent implements OnInit {
  public draggableElement;
  public dragEntered = false;
  public itemDropped$ = new Subject<void>();
  private _width: number;
  private _left: number;
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
      // console.log('drop')
      // console.log('drop1', event.target, event.relatedTarget)
      // event.relatedTarget.parentNode.removeChild(event.relatedTarget)
      // event.target.appendChild(event.relatedTarget)
      // event.relatedTarget.style.left = 0;
      // obj.style.left = 0;
      // event.target.appendChild(obj)
      const model = (window as any).dragData;
      this.scheduleService.placeholderDrop$.next();
      this.reactToDrop({...model, start:Math.round(event.relatedTarget.offsetLeft / this.unit) * this.unit, range:event.relatedTarget.clientWidth })
    })
    .on('dropdeactivate', event => {
      event.target.classList.remove('can-drop');
      event.target.classList.remove('can-catch');
    })
    .on('mousedown', event => {
      if (event.originalTarget.parentElement.nodeName === "APP-ITEM-LIST") {
      
      }
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
