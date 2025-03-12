import { Directive, ElementRef, HostListener } from "@angular/core";
import { EventService } from "src/app/services/event.service";

@Directive({
  selector: "[nectarInfiniteScroll]",
})
export class InfiniteScrollDirective {
  constructor(
    private eventService: EventService,
    private elementRef: ElementRef
  ) {}
  @HostListener("document:scroll", ["$event"])
  onScrollBy(event) {
    const boundedRect = this.elementRef.nativeElement.getBoundingClientRect();
    const { bottom, height } = boundedRect;
    if (bottom - height < 0) {
      this.eventService.broadcastEvent("list-scroll", true);
    }
  }
}
