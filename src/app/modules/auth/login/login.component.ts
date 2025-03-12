import { Component, EventEmitter, Input, OnInit, Output, Inject } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router, NavigationEnd } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { CookieService } from "ngx-cookie-service";
import { CryptoProvider } from "src/app/services/crypto.service";
import { LocalStorageService } from "src/app/services/storage.service";
import { ROUTE_CONSTANT } from "src/app/config/route.constant";
import { EventService } from "src/app/services/event.service";
import { BroadcastChannelService } from "src/app/services/broadcast-channel.service";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { SeoService } from "src/app/services/seo.service";
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: "nectar-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  emailVerifyForm!: FormGroup;
  @Input() userRole: any;
  @Output() emitData: any = new EventEmitter();
  userType: number = 1;
  constructor(
    private apiSerive: ApiService,
    private fb: FormBuilder,
    private router: Router,
    private title: Title,
    private activatedRoute: ActivatedRoute,
    private localStorage: LocalStorageService,
    private toastr: ToastrService,
    private cookieService: CookieService,
    private cryptoService: CryptoProvider,
    private eventService: EventService,
    private broadcastChannelService: BroadcastChannelService,
    private loader: NgxUiLoaderService,
    private SeoService: SeoService,
    @Inject(DOCUMENT) public document: any


  ) { }
  login: boolean = true;
  routes: any = {
    1: {
      login: `/auth/${ROUTE_CONSTANT.AUTH.patientLogin}`,
      register: `/auth/${ROUTE_CONSTANT.AUTH.patientRegister}`,
    },
    2: {
      login: `/auth/${ROUTE_CONSTANT.AUTH.doctorLogin}`,
      register: `/auth/${ROUTE_CONSTANT.AUTH.doctorRegister}`,
    },
    3: {
      login: `/auth/${ROUTE_CONSTANT.AUTH.hospitalLogin}`,
      register: `/auth/${ROUTE_CONSTANT.AUTH.hospitalRegister}`,
    },
  };

  verifyNumber: boolean = false;
  verifyEmail: boolean = false;
  ngOnInit(): void {
    this.userType = this.activatedRoute.snapshot.data["userType"];
    this.verifyNumber = this.activatedRoute.snapshot.data["verified"];
    this.verifyEmail = this.activatedRoute.snapshot.data["verifiedEmail"];
    this.loginForm = this.fb.group({
      phone: ["", [Validators.required, Validators.minLength(10)]],
      checkbox: [false],
    });
    if (this.verifyEmail) {
      this.emailVerifyForm = this.fb.group({
        email: [
          "",
          [
            Validators.required,
            Validators.email,
            Validators.pattern(
              "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$"
            ),
          ],
        ],
      });
    }

    this.getCookiesData();
    this.eventService.getEvent("phone").subscribe((res: any) => {
      if (res) {
        this.login = true;
        this.loginForm.patchValue({ phone: res });
      }
    });
    this.eventService.getEvent("email").subscribe((res: any) => {
      if (res) {
        this.login = true;
        this.emailVerifyForm.patchValue({ email: res });
      }
    });

    this.updateMetaAndTitleBasedOnURL();

    //chnage this titile and meta tags
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateMetaAndTitleBasedOnURL();
      });


  }
  get control() {
    if (this.verifyEmail) {
      return this.emailVerifyForm.controls;
    } else {
      return this.loginForm.controls;
    }
  }
  submitted = false;
  setCookies() {
    if (this.loginForm.value.checkbox) {
      let loginData: any = {
        phone: this.loginForm.value.phone,
        userType: this.userType,
      };
      this.cookieService.set(
        "Logindata",
        this.cryptoService.encrypt(JSON.stringify(loginData))
      );
    } else {
      this.cookieService.delete("Logindata");
    }
  }
  Cookiesdata: any;

  getCookiesData() {
    let cokkiesdata = this.cryptoService.decrypt(
      this.cookieService.get("Logindata")
    );
    if (cokkiesdata && !this.verifyNumber) {
      this.Cookiesdata = JSON.parse(cokkiesdata);
      if (this.Cookiesdata.userType == this.userType)
        this.loginForm.setValue({
          phone: this.Cookiesdata?.phone,
          checkbox: true,
        });
    }
  }

  submit() {
    this.submitted = true;
    if (this.verifyEmail && this.emailVerifyForm.valid) {
      this.loader.start();
      const payload = {
        email: this.emailVerifyForm.value.email,
      };
      this.apiSerive
        .post(API_ENDPOINTS.COMMON.UpdatePhoneEmail, payload)
        .subscribe({
          next: (res: any) => {
            this.loader.stop();
            this.localStorage.setItem(
              "email",
              this.emailVerifyForm.value.email
            );
            this.login = false;
            this.localStorage.setItem("token", res?.result?.token);
            this.broadcastChannelService.publisMessage({
              type: "login",
              payload: "User logged in ",
            });
          },
          error: (error: any) => {
            this.loader.stop();

            console.log(error);
          },
        });
    } else {
      if (this.loginForm.valid && !this.verifyNumber) {
        this.loader.start();
        const payload = {
          phone: this.loginForm.value.phone,
          userType: this.userType,
          countryCode: "+91",
        };
        this.setCookies();
        this.apiSerive.post(API_ENDPOINTS.auth.login, payload).subscribe({
          next: (res: any) => {
            this.loader.stop();
            this.localStorage.setItem("token", res?.result?.token);
            this.login = false;
            this.localStorage.setItem("phone", this.loginForm.value.phone);
          },
          error: (error: any) => {
            this.loader.stop();

            console.log(error);
          },
        });
      } else if (this.loginForm.valid && this.verifyNumber) {
        this.loader.start();
        const payload = {
          phone: this.loginForm.value.phone,
          countryCode: "+91",
        };
        this.apiSerive
          .post(API_ENDPOINTS.COMMON.UpdatePhoneEmail, payload)
          .subscribe({
            next: (res: any) => {
              this.loader.stop();

              this.localStorage.setItem("phone", this.loginForm.value.phone);
              this.login = false;
              this.localStorage.setItem("token", res?.result?.token);
            },
            error: (error: any) => {
              this.loader.stop();
              console.log(error);
            },
          });
      }
    }
  }


  //meta tags update 
  updateMetaAndTitleBasedOnURL(): void {
    const currentUrl = this.router.url;
    if (currentUrl.includes('/auth/patient/login')) {
      this.title.setTitle('Patient Login | NectarPlus.Health');
      this.SeoService.updateTags([
        { name: 'robots', content: 'index, follow' },
        { property: 'og:url', content: this.document.location.href }
      ]);
    } else if (currentUrl.includes('/auth/hospitals/login')) {
      this.title.setTitle('Hospital Login | NectarPlus.Health');
      this.SeoService.updateTags([
        { name: 'robots', content: 'index, follow' },
        { property: 'og:url', content: this.document.location.href }
      ]);

    }

  }



}
