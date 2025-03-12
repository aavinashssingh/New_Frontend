import { NgModule, TransferState } from "@angular/core";
import {
  ServerModule,
} from "@angular/platform-server";

import { AppModule } from "./app.module";
import { AppComponent } from "./app.component";
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
// import { TransferState } from "@angular/platform-browser";
import { translateServerLoaderFactory } from "./shared/loader/translate-server.loader";

@NgModule({
  imports: [
    AppModule,
    ServerModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: translateServerLoaderFactory,
        deps: [TransferState],
      },
    }),
  ],
  bootstrap: [AppComponent],
})
export class AppServerModule { }
