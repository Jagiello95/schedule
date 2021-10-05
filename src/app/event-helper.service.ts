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

  public isResizeTowardsLeft(event, unit) {
    return event.velocity.x < 0 && -event.velocity.x > unit
  }

  public isResizeTowardsRight(event) {
    return event.page.x  >  event.target.getBoundingClientRect().left
  }

  public isCursorLeftFromLeftEdge(event) {
    return event.page.x  <  event.target.getBoundingClientRect().left
  }

  public isCursorLeftFromRightEdge(event) {
    return event.page.x  <  event.target.getBoundingClientRect().right
  }

  public isCursorRightFromRightEdge(event) {
    return event.page.x  >  event.target.getBoundingClientRect().right
  }

  public isInsideLeftEdgeOfContainer(x, unit) {
    return x + unit > 0
  }

  public isMovedByUnit(event, unit) {
    return event.velocity.x > unit
  }

  public isBeingResizedBelowUnit(event, unit) {
    return event.target.clientWidth - unit < unit
  }

  public isBeingResizedOverParentWidth(event, unit) {
    return event.target.clientWidth + event.target.offsetLeft + unit > event.target.parentElement.clientWidth
  }

  public isMoreThanEdgeLeft(event, unit, closestLeft) {
    return event.target.offsetLeft / unit > closestLeft
  }

  public isLessThanEdgeRight(event, unit, closestRight) {
    return ((event.target.offsetLeft + event.target.clientWidth) / unit)  < closestRight
  }



  public assignDatasetValues(event, x,y) {
    Object.assign(event.target.dataset, { x, y })
  }

  public isAvailable(num:number, arr: number[][]) {
    return arr?.every((el: number[])=> {
      return num < el[0] || num >= el[0] + el[1]
    })
  }
  

  constructor() { }
}
