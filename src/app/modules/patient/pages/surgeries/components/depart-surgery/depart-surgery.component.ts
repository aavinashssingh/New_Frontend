// import { Component, Inject, Input, OnInit } from "@angular/core";
// import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
// import { Router, ActivatedRoute } from "@angular/router";
// import { API_ENDPOINTS } from "src/app/config/api.constant";
// import { ApiService } from "src/app/services/api.service";

// @Component({
//   selector: "nectar-depart-surgery",
//   templateUrl: "./depart-surgery.component.html",
//   styleUrls: ["./depart-surgery.component.scss"],
// })
// export class DepartSurgeryComponent implements OnInit {

//   constructor(
//     private route: ActivatedRoute,
//     private apiService: ApiService,
//     private router: Router
//   ) { }
//   tittle: any;
//   questionArray: any[] = [];
//   expanded: boolean[] = []; 

//   ngOnInit(): void {
//     this.getSurgeryNames();
//     this.tittle = localStorage.getItem('departmentName');
//     const storedQuestions = localStorage.getItem('filteredDepartmentQuestions');
//     if (storedQuestions) {
//       this.questionArray = JSON.parse(storedQuestions);
//     }
//     this.expanded = Array(this.questionArray.length).fill(false);
//   }

//   surgeryList: any = [];

//   getSurgeryNames() {
//     const departmentId = this.route.snapshot.paramMap.get('id');
//     this.apiService
//       .get(API_ENDPOINTS.patient.getSurgeryUnderDepartment, { id: departmentId })
//       .subscribe((res: any) => {
//         if (res && res.result && res.result.list) {
//           this.surgeryList = res.result.list;
//         } else {
//           console.error('Unexpected response format:', res);
//         }
//       });
//   }


//   viewSurgery(data: any) {
//     this.router.navigate([`delhi/surgeries/${data?.slug}`]);
//     setTimeout(() => {
//       window.scroll(0, 0);
//     }, 100);
//   }

//   toggleAnswer(index: number): void {
//     this.expanded[index] = !this.expanded[index];
//   }
// }


import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";

@Component({
  selector: "nectar-depart-surgery",
  templateUrl: "./depart-surgery.component.html",
  styleUrls: ["./depart-surgery.component.scss"],
})
export class DepartSurgeryComponent implements OnInit {

  tittle: any;
  questionArray: any[] = [];
  expanded: boolean[] = [];
  constructor(
    private matdialogRef: MatDialogRef<DepartSurgeryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,

    private apiService: ApiService,
    private router: Router
  ) { }
  ngOnInit(): void {
    this.getSurgeryNames();
    this.tittle = localStorage.getItem('departmentName');
    const storedQuestions = localStorage.getItem('filteredDepartmentQuestions');
    if (storedQuestions) {
      this.questionArray = JSON.parse(storedQuestions);
    }
    this.expanded = Array(this.questionArray.length).fill(false);
  }
  surgeryList: any = [];
  getSurgeryNames() {
    this.apiService
      .get(API_ENDPOINTS.patient.getSurgeryUnderDepartment, {
        id: this.data?.id,
      })
      .subscribe((res: any) => {
        this.surgeryList = res?.result?.list;
      });
  }

  close() {
    this.matdialogRef.close();
  }
  viewSurgery(data: any) {
    this.router.navigate([`india/surgeries/${data?.slug}`]);

    this.close();
    setTimeout(() => {
      window.scroll(0, 0);
    }, 100);
  }
}
