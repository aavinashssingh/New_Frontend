import { Component, Input } from "@angular/core";

import { EventService } from "src/app/services/event.service";

@Component({
  selector: "nectar-subheader",
  templateUrl: "./subheader.component.html",
  styleUrls: ["./subheader.component.scss"],
})
export class SubheaderComponent {
  constructor(private eventService: EventService) {}
  @Input() calendar: boolean = false;

  openSidenav() {
    this.eventService.broadcastEvent("sidenav", true);
  }
}
