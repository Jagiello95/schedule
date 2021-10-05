import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { ItemListComponent } from './components/item-list/item-list.component';
import { ScheduleService } from './schedule.service';
import { AjScheduleComponent } from './components/aj-schedule/aj-schedule.component';
import { HoursTimelineComponent } from './components/hours-timeline/hours-timeline.component';
import { ItemXComponent } from './components/item-x/item-x.component';
import { SnapMePipe } from './components/utils/snap-me.pipe';
import { BendMePipe } from './components/utils/bend-me.pipe';

@NgModule({
  declarations: [
    AppComponent,
    ItemListComponent,
    AjScheduleComponent,
    HoursTimelineComponent,
    ItemXComponent,
    SnapMePipe,
    BendMePipe,
  ],
  imports: [
    BrowserModule,
  ],
  providers: [ScheduleService],
  bootstrap: [AppComponent]
})
export class AppModule { }
