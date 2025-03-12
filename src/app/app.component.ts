import {
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
  Renderer2,
} from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { NavigationStart,NavigationEnd,NavigationCancel,NavigationError, Router, RouterModule } from "@angular/router";
import { SeoService } from "./services/seo.service";
import { DOCUMENT, isPlatformBrowser, NgClass,CommonModule  } from "@angular/common";
import { NgxUiLoaderModule,NgxUiLoaderService } from "ngx-ui-loader";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  standalone: true,
  imports: [NgClass, RouterModule, NgxUiLoaderModule,CommonModule ],
})
export class AppComponent implements OnInit {
  isBrowser: boolean = false;
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private seoService: SeoService,
    private renderer: Renderer2,
    private ngxLoader: NgxUiLoaderService,
    private translate: TranslateService,
    @Inject(DOCUMENT) private _document: any,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    translate.use("en");
    // router.events.subscribe((y: NavigationEnd) => {
    //   if (y instanceof NavigationEnd) {
    //     gtag("config", "UA-{ID}", { page_path: y.url });
    //   }
    // });
  }
  title = "nectar";




  ngOnInit(): void {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser && !window['google']) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDb7zoRltrfSat3aq7o9EYF5VV4hEKwNUE&libraries=places`;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    
    if (this.isBrowser) {
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.isLoading = true; // Show loader
        }
        if (
          event instanceof NavigationEnd ||
          event instanceof NavigationCancel ||
          event instanceof NavigationError
        ) {
          setTimeout(() => (this.isLoading = false), 500); // Hide loader after 500ms
        }
      });
    }
  }

  ngAfterViewInit() {
    if (this.isBrowser) this.injectScripts();
  }

  injectScripts() {
    // Google tag (gtag.js)
    const gtmScriptTag = this.renderer.createElement("script");
    gtmScriptTag.type = "text/javascript";
    gtmScriptTag.src =
      "https://www.googletagmanager.com/gtag/js?id=G-FKSTY0HYHH";
    gtmScriptTag.async = true;
    this.renderer.appendChild(this._document.body, gtmScriptTag);

    const gtagInitScript = this.renderer.createElement("script");
    gtagInitScript.type = "text/javascript";
    gtagInitScript.text = `
      window.dataLayer = window.dataLayer || [];

      function gtag() {
        dataLayer.push(arguments);
      }
      gtag('js', new Date());
      gtag('config', 'G-FKSTY0HYHH');
    `;
    gtagInitScript.async = true;
    this.renderer.appendChild(this._document.body, gtagInitScript);

    // Google ads tag
    const adScriptTag = this.renderer.createElement("script");
    adScriptTag.type = "text/javascript";
    adScriptTag.src =
      "https://www.googletagmanager.com/gtag/js?id=AW-11399196295";
    adScriptTag.async = true;
    this.renderer.appendChild(this._document.body, adScriptTag);

    const adInitScript = this.renderer.createElement("script");
    adInitScript.type = "text/javascript";
    adInitScript.text = `
      window.dataLayer = window.dataLayer || [];

      function gtag() {
        dataLayer.push(arguments);
      }
      gtag('js', new Date());
      gtag('config', 'AW-11399196295');
    `;
    adInitScript.async = true;
    this.renderer.appendChild(this._document.body, adInitScript);

    // Google Tag Manager
    const gtagInitScript2 = this.renderer.createElement("script");
    gtagInitScript2.type = "text/javascript";
    gtagInitScript2.text = `
      (function (w, d, s, l, i) {
        w[l] = w[l] || [];
        w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
        var f = d.getElementsByTagName(s)[0],
          j = d.createElement(s),
          dl = l != "dataLayer" ? "&l=" + l : "";
        j.async = true;
        j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
        f.parentNode.insertBefore(j, f);
      })(window, document, "script", "dataLayer", "GTM-W5KG5NRJ");
    `;
    gtagInitScript2.async = true;
    this.renderer.appendChild(this._document.head, gtagInitScript2);
    // Google Analytics ()
    const gtagInitScript3 = this.renderer.createElement("script");
    gtagInitScript3.type = "text/javascript";
    gtagInitScript3.text = `
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        dataLayer.push(arguments);
      }
      gtag('js', new Date());
      gtag('config', 'G-FKSTY0HYHH');
    `;
    gtagInitScript3.async = true;
    this.renderer.appendChild(this._document.head, gtagInitScript3);
    
//     //LinkedIn Markeing Code ( Insight Tag )
//     const gtagInitScript4 = this.renderer.createElement("script");
//     gtagInitScript4.type = "text/javascript";
//     gtagInitScript4.text = `
//     _linkedin_partner_id = "6855788";
// window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
// window._linkedin_data_partner_ids.push(_linkedin_partner_id);
// (function(l) {
// if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
// window.lintrk.q=[]}
// var s = document.getElementsByTagName("script")[0];
// var b = document.createElement("script");
// b.type = "text/javascript";b.async = true;
// b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
// s.parentNode.insertBefore(b, s);})(window.lintrk);
//  `;
//     gtagInitScript4.async = true;
//     this.renderer.appendChild(this._document.body, gtagInitScript4);
    // Meta Pixel Code
    const metaInitScript = this.renderer.createElement("script");
    metaInitScript.type = "text/javascript";
    metaInitScript.text = `
      !function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '359168740010365');
fbq('track', 'PageView');

    `;
    metaInitScript.async = true;
    this.renderer.appendChild(this._document.body, metaInitScript);
  }


}
