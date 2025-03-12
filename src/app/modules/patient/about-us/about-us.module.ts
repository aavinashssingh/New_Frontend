import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { AboutUsRoutingModule } from "./about-us-routing.module";
import { AboutComponent } from "./about/about.component";
import { ValuesComponent } from "./values/values.component";
import { LeadershipComponent } from "./leadership/leadership.component";
import { AboutContainerComponent } from "./about-container/about-container.component";
import { PatientModule } from "../patient.module";

@NgModule({
  declarations: [
    AboutComponent,
    ValuesComponent,
    LeadershipComponent,
    AboutContainerComponent,
  ],
  imports: [CommonModule, AboutUsRoutingModule , PatientModule],
})
export class AboutUsModule {}
