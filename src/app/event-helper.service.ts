import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EventHelperService {


  public isLeftEdge(event) {
    return event.edges.left;
  }

  public isRightEdge(event) {
    return event.edges.right;
  }

  public isResizeBeforeRightEdge(event) {
    return event.rect.width + event.target.offsetLeft <= event.target.parentElement.clientWidth
  }

  public isResizeTowardsLeft(event) {
    return event.velocity.x < 0 && -event.velocity.x > 60
  }

  public isResizeTowardsRight(event) {
    return event.page.x  >  event.target.getBoundingClientRect().left
  }

  public isCursorLeftFromDraggedEdge(event) {
    return event.page.x  <  event.target.getBoundingClientRect().left
  }

  public isInsideLeftEdgeOfContainer(x) {
    return x + 60 > 0
  }

  public isMovedByUnit(event, unit) {
    return event.velocity.x > unit
  }

  public isBeingResizedBelowZero(event, unit) {
    return event.target.clientWidth - unit < 0
  }

  public handlePositiveResizeTowardsLeft(event, unit) {
    event.target.style.left = event.target.offsetLeft - unit + 'px';
    event.target.style.width = event.target.clientWidth + unit + 'px';
  }

  public handleNegativeResizeTowardsRight(event, unit ) {
    event.target.style.left = event.target.offsetLeft + unit + 'px';
    event.target.style.width = event.target.clientWidth - unit + 'px';
  }


  public handlePositiveResizeTowardsRight(event) {
    Object.assign(event.target.style, {
      height: `100%`,
      width: `${event.rect.width}px`,
    })
  }

  public assignDatasetValues(event, x,y) {
    (console.log(event,x,y))
    Object.assign(event.target.dataset, { x, y })
  }

  constructor() { }
}
