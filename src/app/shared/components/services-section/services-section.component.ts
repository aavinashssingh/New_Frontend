import { Component, Input, OnInit, OnChanges, SimpleChanges } from "@angular/core";
import { Router } from "@angular/router";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { CommonService } from "src/app/services/common.service";
import { EventService } from "src/app/services/event.service";
import { Subscription } from "rxjs";

@Component({
  selector: "nectar-services-section",
  templateUrl: "./services-section.component.html",
  styleUrls: ["./services-section.component.scss"],
})
export class ServicesSectionComponent implements OnInit, OnChanges {
  @Input() tab = 1;
  @Input() id: string | null = null;
  @Input() type: string = "doctor";
  @Input() city: string = "";
  @Input() doc_procedure: any[] = [];

  viewMore: boolean = false;
  showAll: boolean = false;
  deviceWidth: number = 0;
  itemPerView: number = 10;
  data: any[] = [];
  serviceArray: any[] = [];
  combinedList: any[] = [];
  private eventSubscription: Subscription = new Subscription();

  constructor(
    private apiService: ApiService,
    private eventService: EventService,
    private commonService: CommonService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.deviceWidth = this.commonService.gettingWinowWidth();
    if (this.id) this.getServices();

    // Merging both event subscriptions to reduce redundant code
    this.eventSubscription.add(
      this.eventService.getEvent("doctor-route").subscribe((res: any) => {
        if (res) {
          this.id = res;
          this.getServices();
        }
      })
    );

    this.eventSubscription.add(
      this.eventService.getEvent("hospital-route").subscribe((res: any) => {
        if (res) {
          this.id = res;
          this.getServices();
        }
      })
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["doc_procedure"]) {
      this.Combinearray();
    }
  }

  getServices() {
    if (!this.id) return;

    const endpoint =
      this.type === "doctor"
        ? `${API_ENDPOINTS.patient.doctorService}/${this.id}`
        : API_ENDPOINTS.patient.hospitalServices;

    const params = this.type === "doctor" ? {} : { establishmentId: this.id, type: 2 };

    this.apiService.get(endpoint, params).subscribe((res: any) => {
      this.data = this.type === "doctor" ? res?.result || [] : res?.result?.data || [];
      this.serviceArray =
        this.deviceWidth < 767 ? this.data.slice(0, this.itemPerView) : this.data;
      this.Combinearray();
    });
  }

  Combinearray() {
    const combined = [...this.serviceArray, ...this.doc_procedure];

    // Remove duplicates based on `_id`
    this.combinedList = Array.from(new Map(combined.map((item) => [item._id, item])).values());
  }

  viewMoreServices() {
    this.showAll = !this.showAll;
  }

  navigateToSearch(routeName: string) {
    const formattedRouteName = this.formatName(routeName);
    const cityname = this.commonService.replaceSpaceWithHyphen(this.city);
    this.router.navigate([`${cityname}/${formattedRouteName}`]);
  }

  formatName(name: string): string {
    return name.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase().replace(/-$/, "");
  }

  ngOnDestroy(): void {
    this.eventSubscription.unsubscribe();
  }
}
