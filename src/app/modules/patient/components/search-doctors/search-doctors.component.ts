import { Component, Inject, OnInit, PLATFORM_ID } from "@angular/core";
import {
  query,
  style,
  group,
  animate,
  transition,
  trigger,
} from "@angular/animations";
import { EventService } from "src/app/services/event.service";
import { CommonService } from "src/app/services/common.service";
import { isPlatformBrowser } from "@angular/common";

const left = [
  query(
    ":enter, :leave",
    style({
      position: "absolute",
      width: "100%",
      transition: "ease-in 0.5s all",
    }),
    {
      optional: true,
    }
  ),
  group([
    query(
      ":enter",
      [
        style({
          transform: "translateY(-120%)",
          transition: "ease-in 0.5s all",
        }),
        animate(".5s ease-out", style({ transform: "translateY(0%)" })),
      ],
      {
        optional: true,
      }
    ),
    query(
      ":leave",
      [
        style({ transform: "translateY(0%)", transition: "ease-in 0.5s all" }),
        animate(
          ".5s ease-out",
          style({
            transform: "translateY(120%)",
            transition: "ease-in 0.5s all",
          })
        ),
      ],
      {
        optional: true,
      }
    ),
  ]),
];

const right = [
  query(
    ":enter, :leave",
    style({
      position: "absolute",
      width: "100%",
      transition: "ease-in 0.5s all",
    }),
    {
      optional: true,
    }
  ),
  group([
    query(
      ":enter",
      [
        style({
          transform: "translateY(120%)",
          transition: "ease-in 0.5s all",
        }),
        animate(".5s ease-out", style({ transform: "translateY(0%)" })),
      ],
      {
        optional: true,
      }
    ),
    query(
      ":leave",
      [
        style({ transform: "translateY(0%)" }),
        animate(".5s ease-out", style({ transform: "translateY(-120%)" })),
      ],
      {
        optional: true,
      }
    ),
  ]),
];

@Component({
  selector: "nectar-search-doctors",
  templateUrl: "./search-doctors.component.html",
  styleUrls: ["./search-doctors.component.scss"],
  animations: [
    trigger("animSlider", [
      transition(":increment", right),
      transition(":decrement", left),
    ]),
  ],
})
export class SearchDoctorsComponent implements OnInit {
  intervalId: any;
  currentNum = 0;
  currentText = "";
  textArray = [
    "Doctor",
    "Orthopaedics",
    "Dentist",
    "General Physician",
    "Infertility Specialist",
    "Neurosurgeon",
    "Cardiologist",
    "Orthodontist",
    "Psychologist",
    "Surgeon",
  ];
  deviceWidth: any;
  show: boolean = false;
  constructor(
    private eventService: EventService,
    private commonService: CommonService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}
  ngOnInit(): void {
    this.deviceWidth = this.commonService.gettingWinowWidth();
    if (isPlatformBrowser(this.platformId)) {
      this.intervalId = setInterval(() => {
        this.initializeNewValue();
      }, 1000);
    }
    this.eventService.getEvent("scrolled-up").subscribe((res) => {
      if (res) {
        this.show = true;
      } else {
        this.show = false;
      }
    });
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }

  initializeNewValue() {
    this.currentText = this.textArray[this.currentNum];
    this.currentNum += 1;
    if (this.currentNum >= this.textArray.length) {
      this.currentNum = 0;
    }
  }
}
