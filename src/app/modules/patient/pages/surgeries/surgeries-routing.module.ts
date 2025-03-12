// import { NgModule } from "@angular/core";
// import { RouterModule, Routes } from "@angular/router";
// import { PopularSurgeryComponent } from "./components/popular-surgery/popular-surgery.component";
// import { SurgeryDetailComponent } from "./components/surgery-detail/surgery-detail.component";
// import { DepartSurgeryComponent } from "./components/depart-surgery/depart-surgery.component";

// const routes: Routes = [
//   { path: "", component: PopularSurgeryComponent },
//   { path: "department/:id", component: DepartSurgeryComponent },
//   { path: ":slug", component: SurgeryDetailComponent },
// ];


// @NgModule({
//   imports: [RouterModule.forChild(routes)],
//   exports: [RouterModule],
// })
// export class SurgeriesRoutingModule { }
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PopularSurgeryComponent } from "./components/popular-surgery/popular-surgery.component";
import { SurgeryDetailComponent } from "./components/surgery-detail/surgery-detail.component";

const routes: Routes = [
  { path: "", component: PopularSurgeryComponent },
  { path: ":slug", component: SurgeryDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SurgeriesRoutingModule {}