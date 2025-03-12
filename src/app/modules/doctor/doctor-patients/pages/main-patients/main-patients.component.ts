import { Component, OnInit, Renderer2 } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute } from "@angular/router";
import { EventService } from "src/app/services/event.service";
import { EditPatientModalComponent } from "../../components/edit-patient-modal/edit-patient-modal.component";
import { ApiService } from "src/app/services/api.service";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { map } from "rxjs";
import { AbstractControlOptions, FormBuilder, FormGroup } from "@angular/forms";
import { FormValidationService } from "src/app/services/form-validation.service";
import { LocalStorageService } from "src/app/services/storage.service";
import { APP_CONSTANTS } from "src/app/config/app.constant";

@Component({
  selector: "nectar-main-patients",
  templateUrl: "./main-patients.component.html",
  styleUrls: ["./main-patients.component.scss"],
})
export class MainPatientsComponent implements OnInit {
  hideView: boolean;
  appointmentList: any;
  patientDetails: any;
  x: number;
  y: number;
  filteredPatientDetails: any[] = []; // To store filtered patient list
  searchQuery: string = ''; // This will hold the search input
  currentName: any;

  constructor(
    private eventService: EventService,
    private matdialog: MatDialog,
    private apiService: ApiService,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private formvalidation: FormValidationService,
    private localStorage: LocalStorageService,
    private renderer: Renderer2
  ) { }



  patientList:any


    genderList = {
    1: "Male",
    2: "Female",
    3: "Other",
  };

  bloodGroupList = {
    1: "A+",
    2: "A-",
    3: "B+",
    4: "B-",
    5: "O+",
    6: "O-",
    7: "AB+",
    8: "AB-",
  };
  // Filter the patient details list
  filterPatients() {
    if (this.searchQuery.trim() === '') {
      // If the search query is empty, show all patients
      this.filteredPatientDetails = this.patientDetails;
    } else {
      // Filter the patient list based on the search query
      this.filteredPatientDetails = this.patientDetails.filter((patient) => {
        return patient.patientName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
               patient.phone.includes(this.searchQuery);
      });
    }
  }
  getStatus(status: number): string {
    if (status === 0) {
      return 'BOOKED';
    } else if (status === -1) {
      return 'CANCEL';
    } else if (status === 1) {
      return 'COMPLETE';
    } else if (status === 2) {
      return 'PENDING';
    } else if (status === -2) {
      return 'RESCHEDULE';
    } else {
      return 'UNKNOWN'; // For any undefined or unrecognized status
    }
  }
  



  
  async ngOnInit(): Promise<void> {


        const approvalStatus = this.localStorage.getItem("approvalStatus");

    if (approvalStatus == APP_CONSTANTS.PROFILE_STATUS.APPROVE) {
      this.hideView = false
      await this.getPatitentList();
    }
    if (approvalStatus == APP_CONSTANTS.PROFILE_STATUS.PENDING ||
      approvalStatus == APP_CONSTANTS.PROFILE_STATUS.DEACTIVATE
      || approvalStatus == APP_CONSTANTS.PROFILE_STATUS.DELETE
      || approvalStatus == APP_CONSTANTS.PROFILE_STATUS.REJECT) {
      this.hideView = true
    }
  }
  
  async getPatitentList(): Promise<void> {
    try {
      // Get patient list from the API
      const res: any = await this.apiService.get(API_ENDPOINTS.doctor.patientList + '?type=2', '').toPromise();
      this.patientList = res.result.data;
  
      // Iterate over each patient and get the details
      for (let element of this.patientList) {
        for (let document of element.documents) {
          try {
            // Fetch patient profile for each document
            const profileRes: any = await this.apiService.get(API_ENDPOINTS.doctor.patientProfile + '?patientId=' + document._id, '').toPromise();
            // Append patient details to the list
            if (!this.patientDetails) {
              this.patientDetails = [];
            }
            this.patientDetails.push(profileRes.result);
          } catch (error) {
            console.error('Error fetching patient profile:', error);
          }
        }
      }
      this.filterPatients()
      // Log the final patient list and details
      console.log('list', this.patientList);
      console.log('detailsssss', this.patientDetails);
  
    } catch (error) {
      console.error('Error fetching patient list:', error);
      this.patientList = [];
    }
  }
  
  

  getDetails(item: any) {
    const id = item._id;
    this.currentName = item.patientName;
    this.apiService
      .get(API_ENDPOINTS.doctor.patientAppointmentList + '?patientId=' + id, '')
      .subscribe({
        next: (res: any) => {
          const { count, data } = res.result;
          // If date is a string and needs conversion, ensure it's in a Date object format
          this.appointmentList = count ? data.map((appointment: any) => ({
            ...appointment,
            date: new Date(appointment.date)  // Convert string to Date object
          })) : [];
          this.openModal('details');
        },
        error: (error: any) => {
          this.appointmentList = [];
        },
      });
  }
  

  isSubmenuOpen = false;

  settingtoggleSubmenu(event: Event): void {
    event.preventDefault(); 
    this.isSubmenuOpen = !this.isSubmenuOpen; 
  }

  
  getPatientDetail(patientId) {
    
    this.apiService
      .get(API_ENDPOINTS.doctor.patientProfile, { patientId })
      .subscribe({
        next: (res: any) => {
          this.patientDetails = res.result;
        },
        error: (error: any) => {
          console.log(error);
          this.patientDetails = {};
        },
      });
    this.getPatientAppointment({ patientId });
  }
  
  getPatientAppointment(payload) {
    this.apiService
      .get(API_ENDPOINTS.doctor.patientAppointmentList, payload)
      .subscribe({
        next: (res: any) => {
          const { count, data } = res.result;
          this.appointmentList = count ? data : [];
        },
        error: (error: any) => {
          this.appointmentList = [];
        },
      });
  }








  onMenuClick() {
    const sideMenu = document.getElementById("sideMenu");
    const innerArea = document.getElementById("clickToCloseArea");
    if (sideMenu) {
      if (sideMenu.classList.contains("mobileMenu") && innerArea.classList.contains("openedSideBar")  ) {
        this.renderer.removeClass(sideMenu, "mobileMenu");
        this.renderer.removeClass(innerArea, "openedSideBar");


      } else {
        this.renderer.addClass(sideMenu, "mobileMenu");
        this.renderer.addClass(innerArea, "openedSideBar");
      }
    }
  }

  closeSideBar(){
    const innerArea = document.getElementById("clickToCloseArea");
    const sideMenu = document.getElementById("sideMenu");
  if (innerArea.classList.contains("openedSideBar")) {
    this.renderer.removeClass(innerArea, "openedSideBar");
    this.renderer.removeClass(sideMenu, "mobileMenu");

  } 

  }

 

  onCloseMenuClick() {
    const sideMenu = document.getElementById("sideMenu");
    if (sideMenu && sideMenu.classList.contains("mobileMenu")) {
      this.renderer.removeClass(sideMenu, "mobileMenu");
    }
  }
  // toggle side menu sub menu
  toggleSubmenu(event: Event): void {
    event.preventDefault(); // Prevent the default action of the anchor tag
    const target = event.currentTarget as HTMLElement;
    const submenu = target.nextElementSibling as HTMLElement;
    if (submenu) {
      // Toggle the visibility of the submenu
      submenu.style.display = submenu.style.display === "block" ? "none" : "block";
      // Optionally hide other submenus if needed
      const allSubmenus = document.querySelectorAll(".submenu");
      allSubmenus.forEach((sm) => {
        if (sm !== submenu) {
          (sm as HTMLElement).style.display = "none";
        }
      });
    }
  }


  openModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      modalElement.classList.add("show", "d-block");
      modalElement.setAttribute("aria-modal", "true");
      modalElement.setAttribute("role", "dialog");
    }
  }

  closeModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      modalElement.classList.remove("show", "d-block");
      modalElement.removeAttribute("aria-modal");
      modalElement.removeAttribute("role");


    }
  }

  // oldcode

  // today: boolean = true;
  // heading = "My Patients";
  // nodata: boolean = true;
  // appointmentList: any = [];
  // filterForm: FormGroup;


  // validateForm() {
  //   this.filterForm = this.fb.group(
  //     {
  //       status: [],
  //       fromDate: [],
  //       toDate: [],
  //     },
  //     {
  //       validator: [this.formvalidation.fromToValidation("fromDate", "toDate")],
  //     } as AbstractControlOptions
  //   );
  // }
  // ngOnInit(): void {

  //   const approvalStatus = this.localStorage.getItem("approvalStatus");

  //   if (approvalStatus == APP_CONSTANTS.PROFILE_STATUS.APPROVE) {
  //     this.hideView = false
  //   }
  //   if (approvalStatus == APP_CONSTANTS.PROFILE_STATUS.PENDING ||
  //     approvalStatus == APP_CONSTANTS.PROFILE_STATUS.DEACTIVATE
  //     || approvalStatus == APP_CONSTANTS.PROFILE_STATUS.DELETE
  //     || approvalStatus == APP_CONSTANTS.PROFILE_STATUS.REJECT) {
  //     this.hideView = true
  //   }


  //   this.validateForm();
  //   this.activatedRoute.paramMap
  //     .pipe(map(() => window.history.state))
  //     .subscribe((res: any) => {
  //       if (res?.type) {
  //         this.payload.type = res?.type;
  //       }
  //       if (res?.text) {
  //         this.payload.search = res?.text;
  //       }
  //       if (res.patientId) {
  //         this.payload.type = 2;
  //         this.patientId = res.patientId;
  //         this.getPatitentList(true);
  //       } else {
  //         this.getPatitentList();
  //       }
  //     });
  //   this.eventService.broadcastEvent("subheading", this.heading);

  //   this.eventService.getEvent("tab-change").subscribe((res: any) => {
  //     if (res) {
  //       this.payload.search = res;
  //       this.changingList(2);
  //     } else {
  //       delete this.payload.search;
  //       this.getPatitentList();
  //     }
  //   });
  // }

  // changingList(type: number) {
  //   this.filterForm.reset();
  //   this.payload.type = type;
  //   this.x = 0;
  //   this.y = 0;
  //   this.getPatitentList();
  // }
  // x: number = 0;
  // y: number = 0;
  // genderList = {
  //   1: "Male",
  //   2: "Female",
  //   3: "Other",
  // };
  // bloodGroupList = {
  //   1: "A+",
  //   2: "A-",
  //   3: "B+",
  //   4: "B-",
  //   5: "O+",
  //   6: "O-",
  //   7: "AB+",
  //   8: "AB-",
  // };
  // payload: any = {
  //   type: 1,
  // };
  // patientDetails: any;
  // patientList = [];
  // patientId: string;
  // listingArray = [
  //   { name: "Ajay Sharma", selected: false },
  //   { name: "Shivam Kumar", selected: false },
  //   { name: "Pankaj", selected: true },
  // ];
  // vitalArray = [
  //   "WEIGHT (kg)",
  //   "B.P. (mmHg)",
  //   "PULSE (Heart beats/min)",
  //   "TEMPERATURE (°C)",
  //   "RESP. RATE (Breaths/min)",
  // ];
  // vitalValues = ["64", "140 / 90", "40", "36.1%", "18"];
  // symptoms = ["headache", "Dry mouth"];
  // medicineArray = ["Drug", "DOSAGE & FREQUENCY", "DURATION", "INSTRUCTIONS"];
  // medicineValue = ["tablet PCM (500 MG)", "1 Tablet", "7 Days"];
  // labTest = ["Lab Test", "Instructions"];
  // labValues = ["Fasting Blood Sugar (FBS)"];
  // apiCalled: boolean = false;
  // onOpenDialog() {
  //   const editDialog = this.matdialog.open(EditPatientModalComponent, {
  //     width: "70vw",
  //     data: {
  //       patientDetails: this.patientDetails,
  //     },
  //   });
  //   editDialog.afterClosed().subscribe((res: boolean) => {
  //     if (res) {
  //       this.getPatientDetail(this.x, this.y);
  //     }
  //   });
  // }

 

  // getPatitentList(redirected: boolean = false) {
  //   if (!this.payload.search) {
  //     delete this.payload.search;
  //   }

  //   this.apiService
  //     .get(API_ENDPOINTS.doctor.patientList, this.payload)
  //     .subscribe({
  //       next: (res: any) => {
  //         this.handlePatientListResponse(res, redirected);
  //       },
  //       error: (error: any) => {
  //         this.patientList = [];
  //       },
  //     });
  // }

  // handlePatientListResponse(res: any, redirected: boolean) {
  //   if (res.result.count) {
  //     this.patientList = res.result.data;

  //     if (redirected) {
  //       this.findPatientDocumentIndex();
  //     }

  //     this.getPatientDetails();
  //   } else {
  //     this.clearPatientDetails();
  //   }
  // }

  // findPatientDocumentIndex() {
  //   for (let i = 0; i < this.patientList.length; i++) {
  //     const j = this.patientList[i].documents.findIndex(
  //       (item) => item._id == this.patientId
  //     );
  //     if (j != -1) {
  //       this.x = i;
  //       this.y = j;
  //       break;
  //     }
  //   }
  // }

  // getPatientDetails() {
  //   this.getPatientDetail(this.x, this.y);
  // }

  // clearPatientDetails() {
  //   this.patientDetails = null;
  //   this.patientList = [];
  // }

  // getPatientDetail(x: number, y: number) {
  //   this.x = x;
  //   this.y = y;
  //   const patientId = this.patientList[x].documents[y]._id;
  //   this.apiService
  //     .get(API_ENDPOINTS.doctor.patientProfile, { patientId })
  //     .subscribe({
  //       next: (res: any) => {
  //         this.patientDetails = res.result;
  //       },
  //       error: (error: any) => {
  //         console.log(error);
  //         this.patientDetails = {};
  //       },
  //     });
  //   this.getPatientAppointment({ patientId });
  // }
  // getPatientAppointment(payload) {
  //   this.apiService
  //     .get(API_ENDPOINTS.doctor.patientAppointmentList, payload)
  //     .subscribe({
  //       next: (res: any) => {
  //         this.apiCalled = true;
  //         const { count, data } = res.result;
  //         this.appointmentList = count ? data : [];
  //       },
  //       error: (error: any) => {
  //         this.apiCalled = true;
  //         this.appointmentList = [];
  //         this.apiCalled = true;
  //       },
  //     });
  // }

  // openSidenav() {
  //   this.eventService.broadcastEvent("sidenav", true);
  // }
  // onFiltering() {
  //   if (this.filterForm.valid) {
  //     const payload: any = {
  //       patientId: this.patientList[this.x].documents[this.y]._id,
  //     };
  //     for (let key in this.filterForm.value) {
  //       if (this.filterForm.value[key] != null) {
  //         payload[key] = this.filterForm.value[key];
  //       }
  //     }
  //     this.getPatientAppointment(payload);
  //   }
  // }
  // onResetForm() {
  //   this.filterForm.reset();
  //   const patientId = this.patientList[this.x].documents[this.y]._id;
  //   this.getPatientAppointment({ patientId });
  // }

  // onMenuClick() {
  //   const sideMenu = document.getElementById("sideMenu");
  //   if (sideMenu) {
  //     if (sideMenu.classList.contains("mobileMenu")) {
  //       this.renderer.removeClass(sideMenu, "mobileMenu");
  //     } else {
  //       this.renderer.addClass(sideMenu, "mobileMenu");
  //     }
  //   }
  // }
  // onCloseMenuClick() {
  //   const sideMenu = document.getElementById("sideMenu");
  //   if (sideMenu && sideMenu.classList.contains("mobileMenu")) {
  //     this.renderer.removeClass(sideMenu, "mobileMenu");
  //   }
  // }
  // // toggle side menu sub menu
  // toggleSubmenu(event: Event): void {
  //   event.preventDefault(); // Prevent the default action of the anchor tag
  //   const target = event.currentTarget as HTMLElement;
  //   const submenu = target.nextElementSibling as HTMLElement;
  //   if (submenu) {
  //     // Toggle the visibility of the submenu
  //     submenu.style.display = submenu.style.display === "block" ? "none" : "block";
  //     // Optionally hide other submenus if needed
  //     const allSubmenus = document.querySelectorAll(".submenu");
  //     allSubmenus.forEach((sm) => {
  //       if (sm !== submenu) {
  //         (sm as HTMLElement).style.display = "none";
  //       }
  //     });
  //   }
  // }
}
