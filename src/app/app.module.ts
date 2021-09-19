import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { ItemYComponent } from './components/item-y/item-y.component';
import { DragulaModule } from 'ng2-dragula';
import { ItemListComponent } from './components/item-list/item-list.component';

import { AngularResizeElementModule } from 'angular-resize-element';
import { DraggableDirective } from './draggable.directive';
import { DroppableDirective } from './droppable.directive';
import { SnappableDirective } from './snappable.directive';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ResizableDraggableComponent } from './components/resizable-draggable/resizable-draggable.component';
import { ScheduleService } from './schedule.service';
import { AjScheduleComponent } from './components/aj-schedule/aj-schedule.component';
import { HoursTimelineComponent } from './components/hours-timeline/hours-timeline.component';
import { ItemXComponent } from './components/item-x/item-x.component';
import { SnapMePipe } from './components/utils/snap-me.pipe';
import { PlaceholderComponent } from './components/placeholder/placeholder.component';

@NgModule({
  declarations: [
    AppComponent,
    ItemYComponent,
    ItemListComponent,
    DraggableDirective,
    DroppableDirective,
    SnappableDirective,
    ResizableDraggableComponent,
    AjScheduleComponent,
    HoursTimelineComponent,
    ItemXComponent,
    SnapMePipe,
    PlaceholderComponent
  ],
  imports: [
    DragDropModule,
    BrowserModule,
    DragulaModule.forRoot(),
    AngularResizeElementModule
  ],
  providers: [ScheduleService],
  bootstrap: [AppComponent]
})
export class AppModule { }
