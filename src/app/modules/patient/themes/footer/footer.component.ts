import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { Subscription } from "rxjs";
import { EventService } from "src/app/services/event.service";

@Component({
  selector: "nectar-footer",
  templateUrl: "./footer.component.html",
  styleUrls: ["./footer.component.scss"],
})
export class FooterComponent implements OnInit, OnDestroy {
  constructor(private router: Router, private eventService: EventService) { }
  footer: boolean = true;
  mode: string = "patient";
  newLogin = false;
  newRegister = false;
  eventService$: Subscription;
  routerEvents$: Subscription;

  // ngOnInit(): void {

  //   if(this.router.url=='/auth/doctors/newlogin'){
  //     this.newLogin=true
  //     }
  //   if(this.router.url=='/auth/doctors/newRegister'){
  //     this.newRegister=true
  //     }

  //   let data = this.router.url.split("/");
  //   this.mode = data[1] == "register" ? "register" : "normal";
  //   this.getEvents();
  // }


  ngOnInit(): void {
    // Subscribe to Router events to detect when the route changes
    this.routerEvents$ = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Route has changed, check the new URL
        this.checkRoute();
      }
    });

    // Initial check for the current route
    this.checkRoute();
    this.getEvents();
  }
  checkRoute(): void {
    const currentUrl = this.router.url;

    // Reset the flags before setting them
    this.newLogin = false;
    this.newRegister = false;

    if (currentUrl === '/auth/doctors/newlogin') {
      this.newLogin = true;
    }
    if (currentUrl === '/auth/doctors/newRegister') {
      this.newRegister = true;
    }

    // Handle the mode based on URL
    const data = currentUrl.split('/');
    this.mode = data[1] === 'register' ? 'register' : 'normal';
  }
  ngOnDestroy(): void {
    // Unsubscribe from subscriptions to avoid memory leaks
    if (this.routerEvents$) {
      this.routerEvents$.unsubscribe();
    }
    if (this.eventService$) {
      this.eventService$.unsubscribe();
    }
  }

  getEvents() {
    this.eventService$ = this.eventService
      .getEvent("footer")
      .subscribe((res: string) => {
        if (res) {
          this.mode = res;
        }
      });
  }

  year = new Date().getFullYear();

  listing: any = [
    {
      title: "Nectar+",
      data: [
        { name: "Find Doctors", route: "/hospital-list" },
        { name: "About us", route: "/about-us/about" },
        { name: "Blog" },
        { name: "Contact us", route: "/contact-us" },
        { name: "Surgeries", route: "/surgeries" },
      ],
      panelOpenState: false,
    },
    {
      title: "For patients",
      data: [
        { name: "Search for doctors", route: "/hospital-list" },
        { name: "Search for clinics", route: "/hospital-list" },
        { name: "Search for hospitals", route: "/hospital-list" },
        { name: "Read health articles" },
      ],
      panelOpenState: false,
    },
    {
      title: "For doctors",
      data: [{ name: "Nectar Profile", route: "/auth/doctors/newlogin" }],
      panelOpenState: false,
    },
    {
      title: "For Clinics",
      data: [{ name: "Nectar Profile", route: "/auth/hospitals/login" }],
      panelOpenState: false,
    },
    {
      title: "For Hospitals",
      data: [{ name: "Nectar Profile", route: "/auth/hospitals/login" }],
      panelOpenState: false,
    },
    {
      title: "More",
      data: [
        { name: "Privacy Policy", route: "/privacy-policy" },
        { name: "Terms and condition", route: "/terms-conditions" },
      ],
      panelOpenState: false,
    },

  ];

  scrollOnTop() {
    scroll(0, 0);
    this.eventService.broadcastEvent("reset-header", true);
  }
  redirection(data: any) {
    if (data?.name === "Blog") {
      window.open("https://blog.nectarplus.health/", "_blank");
    } else if (data?.route) {
      this.router.navigate([data?.route]);
      this.scrollOnTop();
    }
  }

}
