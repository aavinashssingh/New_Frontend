import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  Renderer2,
} from "@angular/core";
import { NavigationEnd, NavigationStart, Router } from "@angular/router";
import { Subscription, filter } from "rxjs";

import { EventService } from "src/app/services/event.service";
import { SeoService } from "src/app/services/seo.service";

@Component({
  selector: "nectar-themes",
  templateUrl: "./themes.component.html",
  styleUrls: ["./themes.component.scss"],
})
export class ThemesComponent implements OnInit, OnDestroy {
  @ViewChild("matdrawer") public matdrawer;
  matDrawer$: Subscription;
  open: boolean = false;
  subheader: boolean = false;
  showHeader: boolean = true;

  constructor(
    private eventService: EventService,
    private router: Router,
    private seoService: SeoService,
    private renderer: Renderer2
  ) { }

  ngOnInit(): void {
    this.seoService.noIndexRobot();
    this.getEvents();
    this.showHeader = this.router.url != "/doctor/calendar";
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        window.scrollTo(0, 0);
      }
    });
  }

  onClose() {
    this.matdrawer.toggle();
  }

  ngOnDestroy(): void {
    this.matDrawer$?.unsubscribe();
    this.seoService.indexAndFollowRobot();
  }

  getEvents() {
    this.matDrawer$ = this.eventService
      .getEvent("sidenav")
      .subscribe((res: boolean) => {
        if (res) {
          this.matdrawer.toggle();
        }
      });
    this.router.events
      .pipe(filter((event) => event instanceof NavigationStart))
      .subscribe((event: NavigationStart) => {
        const { url } = event;
        this.showHeader = url != "/doctor/calendar";
      });
  }
}
