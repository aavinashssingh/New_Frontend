import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  OnInit,
  Output,
} from "@angular/core";
import { fromEvent, take } from "rxjs";

@Directive({
  selector: "[nectarClickOutside]",
})
export class ClickOutsideDirective implements OnInit {
  constructor(private elementRef: ElementRef) {}
  @Output() clickOutside: EventEmitter<boolean> = new EventEmitter();
  captured: boolean = false;
  @HostListener("document:click", ["$event"]) toggle(event: Event) {
    if (!this.captured) {
      return;
    }
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.clickOutside.emit();
    }
  }
  ngOnInit(): void {
    fromEvent(document, "click")
      .pipe(take(1))
      .subscribe(() => (this.captured = true));
  }
}
