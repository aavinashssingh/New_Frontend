import { DatePipe } from "@angular/common";
import { Component, Inject, Input, OnInit, ViewChild } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { OwlOptions, CarouselComponent } from "ngx-owl-carousel-o";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { APP_CONSTANTS } from "src/app/config/app.constant";
import { LoginModalComponent } from "src/app/modules/patient/pages/hospitals/login-modal/login-modal.component";
import { ApiService } from "src/app/services/api.service";
import { CommonService } from "src/app/services/common.service";
import { EventService } from "src/app/services/event.service";
import { GoogleMapsService } from "src/app/services/google-maps.service";
import { getCurrentOrNextYear } from "src/app/services/helper.service";
import { LocalStorageService } from "src/app/services/storage.service";

@Component({
  selector: "nectar-clinicappointment",
  templateUrl: "./clinicappointment.component.html",
  styleUrls: ["./clinicappointment.component.scss"],
})


export class ClinicappointmentComponent implements OnInit {
  toggle: boolean = false;
  selectedTab: any ;
  doctoar_name: string = ''
  deviceWidth: any;
  hideFlagTab:any=0
  stateList: any;


  @ViewChild("carousel") carousel: CarouselComponent;
  @Input() newsId: string;

  customOptions: OwlOptions = {
    loop: false,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    
    // stagePadding:40,
    startPosition: 0,
    margin: 0,
    center: true,
    navText: [
      '<img loading="lazy"src="assets/images/leftarrow.png">',
      '<img loading="lazy"src="assets/images/rightarow.png">',
    ],
    responsive: {
      0: {
        items: 1.8,
      },
      300: {
        items: 3,
      },
    },
    nav: true,
  };
  focusDate: any;
  constructor(
    private datepipe: DatePipe,
    private apiService: ApiService,
    private localStorage: LocalStorageService,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ClinicappointmentComponent>,
    public gService: GoogleMapsService,
    private eventService: EventService,
    private commonService: CommonService,
    private dialog: MatDialog
  ) { }
  timing = [];
  slots: any = [];
  ngOnInit(): void {
    this.selectedTab=1
    this.deviceWidth = this.commonService.gettingWinowWidth();
    this.getState()
    this.getFutureDates();
    let currentYear = new Date().getFullYear();
    if (this.data) {
      this.selectedHospital = { _id: this.data?.establishmentId };
      if (this.dates.indexOf(this.data?.date) != -1) {
        this.customOptions.startPosition = this.dates.indexOf(this.data?.date);
      } else if (
        new Date(this?.data?.date + " " + currentYear).getDate() ==
        new Date().getDate()
      ) {
        this.customOptions.startPosition = 0;
      } else {
        this.customOptions.startPosition = 1;
      }
      this.focusDate = this.data?.date.toString();
    }
    this.getDoctorDetails();
  }

  getState() {
    this.apiService.get(API_ENDPOINTS.MASTER.state, {}).subscribe({
      next: (res) => {
        this.stateList = res.result.data;
      },
      error: (error: any) => {
        this.stateList = [];
      },
    });
  }

  getStateName(stateId: string): string {
    const state = this.stateList.find((s) => s._id === stateId);
    return state ? state.name : 'Unknown State'; // Fallback if state not found
  }

  
  openGoogleMaps(item: any): void {

    if(item?.location?.coordinates?.[1]== 28.6448 && item?.location?.coordinates?.[0]== 77.216721)
    {
      const address = `${item?.address?.landmark} ${item?.address?.locality}, ${item?.address?.city}, ${this.getStateName(item?.address?.state)} ${item?.address?.pincode}`;
    
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
      
      window.open(googleMapsUrl, '_blank'); 
    }
    else{
      this.gService.redirectToGoogleMaps(
        item?.location?.coordinates?.[1] ,
        item?.location?.coordinates?.[0] 
      )
    }
  }
  selectTab(tabNumber: number) {

    if(this.establishmentDetail[0]?.consultationFees==-1 || this.establishmentDetail[0]?.consultationFees==0 || this.establishmentDetail[0]?.consultationFees==null || this.establishmentDetail[0]?.consultationFees==undefined){
      this.selectedTab=2
      this.hideFlagTab=1
    }
    if(this.establishmentDetail[0]?.videoConsultationFees==-1 || this.establishmentDetail[0]?.videoConsultationFees==0 || this.establishmentDetail[0]?.videoConsultationFees==null || this.establishmentDetail[0]?.videoConsultationFees==undefined){
      this.selectedTab=1
      this.hideFlagTab=2
    }

    if(this.hideFlagTab!=tabNumber)
    this.selectedTab = tabNumber;
  }


  onCarouselInitialized(event: any) { }

  carouselChange(event: any) {
    this.changeHospitalFlag=true

    this.focusDate = this.dates[event?.startPosition];
    if (this.focusDate == "Today") {
      let date = new Date();
      this.focusDate = this.datepipe.transform(date, "EEE, d MMM");
    } else if (this.focusDate == "Tomorrow") {
      let today = new Date();
      today.setDate(today.getDate() + 1);
      this.focusDate = this.datepipe.transform(today, "EEE, d MMM");
    }
    this.getDoctorDetails();
  }

  dates: any = [];
  getFutureDates() {
    let today = new Date();

    for (let i = 0; i < 14; i++) {
      let date: any = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
      date = this.datepipe.transform(date, "EEE, d MMM");
      this.dates.push(date);
    }
    this.dates[0] = "Today";
    this.dates[1] = "Tomorrow";
  }
  establishmentDetail: any = [];
  morningSlots: any = [];
  noonSlots: any = [];
  eveSlots: any = [];
  availableSlots: any;
  getDoctorDetails(obj: any = {}) {
    const doctorDetail = JSON.parse(this.localStorage.getItem("doctor-detail")) || {};
    this.localStorage.removeItem("loginUserDetails")


    let params: any = {
      dateString: this.focusDate + ", " + getCurrentOrNextYear(this.focusDate),
      docId: this.data.id,
    };
    if (obj.establishmentId) {
      params.establishmentId = obj.establishmentId;
    } else if (this.selectedHospital) {
      params.establishmentId = this.selectedHospital?._id;
    }
    this.apiService
      .get(`${API_ENDPOINTS.patient.clinicVisitAppointment}`, params)
      .subscribe((res: any) => {
        const doctorDetail = res?.result?.doctors?.[0];
        this.localStorage.setItem("loginUserDetails", JSON.stringify(doctorDetail))


        this.establishmentDetail =
          res?.result?.doctors[0]?.establishmentDetails;

          if(!this.changeHospitalFlag){
            if(this.establishmentDetail[0]?.consultationType=='video'){
              this.selectedTab=1
              this.hideFlagTab=2
            }
            if(this.establishmentDetail[0]?.videoConsultationFees==null){
              this.selectedTab=1
              this.hideFlagTab=2
            }
            if(this.establishmentDetail[0]?.consultationType=='In-clinic' && this.establishmentDetail[0]?.consultationDetails.isVideo==false ){
              this.selectedTab=1
              this.hideFlagTab=2
            }
            
            
          
            if(this.establishmentDetail[0]?.consultationFees==-1 || this.establishmentDetail[0]?.consultationFees==0 || this.establishmentDetail[0]?.consultationFees==null || this.establishmentDetail[0]?.consultationFees==undefined){
              this.selectedTab=2
              this.hideFlagTab=1
            }
            if(this.establishmentDetail[0]?.videoConsultationFees==-1 || this.establishmentDetail[0]?.videoConsultationFees==0 || this.establishmentDetail[0]?.videoConsultationFees==null || this.establishmentDetail[0]?.videoConsultationFees==undefined){
              this.selectedTab=1
              this.hideFlagTab=2
            }
          }
          this.changeHospitalFlag=false

        if (this.selectedHospital) {
          let index = this.establishmentDetail.findIndex(
            (x) => x._id == this.selectedHospital._id
          );
          let temp = this.establishmentDetail[0];
          this.establishmentDetail[0] = this.establishmentDetail[index];
          this.establishmentDetail[index] = temp;
        }
        const doctorName = res.result.doctors[0].name;
        this.doctoar_name = doctorName
        this.morningSlots = res?.result?.timeSlot?.morningSlots;
        this.noonSlots = res?.result?.timeSlot?.afternoonSlots;
        this.eveSlots = res?.result?.timeSlot?.eveningSlots;
        this.availableSlots = res?.result?.availableSlot;
      });
  }

  selectedHospital: any;
  changeHospitalFlag: boolean=false;

  selectHospital(data: any ) {

    this.changeHospitalFlag=true
    this.selectedHospital = data;

    if(data?.consultationFees==-1 || data?.consultationFees==0  || data?.consultationFees==null || data?.consultationFees==undefined ) {
      this.selectedTab=2
      this.hideFlagTab=1
      
    } 

    else if(data?.videoConsultationFees==-1 || data?.videoConsultationFees==0  || data?.videoConsultationFees==null || data?.videoConsultationFees==undefined ) {
      this.selectedTab=1
      this.hideFlagTab=2
      
    } 
    else{
      this.hideFlagTab=3
    }



    this.getDoctorDetails({ establishmentId: data._id });

    this.toggle = !this.toggle;
  }

  selectTime(time: any, shift: string) {
    const userType = this.localStorage.getItem("userType");
    let obj = {
      date: this.focusDate + ", " + getCurrentOrNextYear(this.focusDate),
      time: time,
      establishmentId:
        this.selectedHospital?._id ?? this.establishmentDetail[0]?._id,
      consultFee:
        this.selectedHospital?.consultationFees ??
        this.establishmentDetail[0]?.consultationFees,
        consultVideoFee:
        this.selectedHospital?.videoConsultationFees ??
        this.establishmentDetail[0]?.videoConsultationFees,
    };
    this.localStorage.setItem("appoint-time", JSON.stringify(obj));
    this.localStorage.setItem("appoint-type", JSON.stringify(this.selectedTab));
    if (userType == APP_CONSTANTS.USER_TYPES.PATIENT) {

      this.eventService.broadcastEvent("reset-header", true);
      if (this.localStorage.getItem("token")) {
        this.router.navigate(["/appointment-booking"]);
      } else {
        this.localStorage.setItem("appointmentBooking", true);
        this.router.navigate(["/auth/patient/login"]);
      }
      this.dialogRef.close();
      setTimeout(() => {
        window.scroll(0, 0);
      }, 500);

    } else {
      this.dialog.open(LoginModalComponent, {
        width: '484px', // Adjust the size as per your needs
        disableClose: true,
        data: {
          type: 'patient', // Or other data you want to pass to the modal
          // name: this.doctorDetail?.name, // Example of data being passed
        },
      });
      return;
    }
  }

  getClickedDate(data: any) {
    this.carousel.to(data);
  }
}
