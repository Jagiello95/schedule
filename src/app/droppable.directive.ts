import {Directive, ElementRef, EventEmitter, Input, OnInit, Output} from '@angular/core';
import interact from 'interactjs';
import { ScheduleService } from './schedule.service';

@Directive({
  selector: '[appDroppable]'
})
export class DroppableDirective implements OnInit {

  @Input()
  options: any;

  @Output()
  dropping: EventEmitter<any> = new EventEmitter();

  constructor(private elementRef: ElementRef, public scheduleService: ScheduleService) {}

  ngOnInit(): void {
    interact(this.elementRef.nativeElement)
      .dropzone(Object.assign({}, this.options || {}))
      .on('dropactivate', event => event.target.classList.add('can-drop'))
      .on('dragenter', event => {
        const draggableElement = event.relatedTarget;
        const dropzoneElement = event.target;

        dropzoneElement.classList.add('can-catch');
        draggableElement.classList.add('drop-me');

      })
      .on('dragleave', event => {
        event.target.classList.remove('can-catch', 'caught-it');
        event.relatedTarget.classList.remove('drop-me');
      })
      .on('drop', event => {
        const model = (window as any).dragData;
        
        this.reactToDrop({...model, top:event.relatedTarget.style.top, height:event.relatedTarget.style.height })
        if (typeof (model) === 'object') {
          this.dropping.emit(model);
        }
        event.target.classList.add('caught-it');

        if ((window as any).document.selection) {
          (window as any).document.selection.empty();
        } else {
          window.getSelection().removeAllRanges();
        }
      })
      .on('dropdeactivate', event => {
        event.target.classList.remove('can-drop');
        event.target.classList.remove('can-catch');
      });
  }

  createComponent() {
    
  }

  reactToDrop(model: any) {
    this.scheduleService.changeTasks(model.current, 2, model)
  }

  
}