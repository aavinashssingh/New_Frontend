import { DOCUMENT } from "@angular/common";
import { Inject, Injectable, Renderer2 } from "@angular/core";
import { Meta } from "@angular/platform-browser";
import { Router } from "@angular/router";

@Injectable({
  providedIn: "root",
})
export class SeoService {
  constructor(
    private meta: Meta,
    @Inject(DOCUMENT) private _document: Document,
    private router: Router
  ) {}

  updateTags(data: any) {
    data.forEach((element: any) => {
      this.meta.updateTag(element);
    });
  }

  setCanonicalUrl() {
    const currentUrl = this.router.url.split("?")[0];

    let url = "https://nectarplus.health" + currentUrl;
    const head = this._document.getElementsByTagName("head")[0];

    let element: HTMLLinkElement =
      this._document.querySelector(`link[rel='canonical']`) || null;

    if (element == null) {
      element = this._document.createElement("link") as HTMLLinkElement;
      head.appendChild(element);
    }

    element.setAttribute("rel", "canonical");
    element.setAttribute("href", url);
  }

  noIndexRobot() {
    this.meta.updateTag({ name: "robots", content: "noindex, nofollow" });
  }

  indexAndFollowRobot() {
    this.meta.updateTag({ name: "robots", content: "index, follow" });
  }
  setJsonLd(renderer2: Renderer2, data: any): void {
    let script = renderer2.createElement("script");
    script.type = "application/ld+json";
    script.text = `${JSON.stringify(data)}`;
    renderer2.appendChild(this._document.body, script);
  }

  removeExistedTags() {
    const scriptElements = this._document.querySelectorAll(
      'script[type="application/ld+json"]'
    );
    scriptElements.forEach((script) => {
      script.remove();
    });
  }

  appendScript(content: string, renderer: Renderer2) {
    const script = renderer.createElement("script");
    script.type = "text/javascript";

    const scriptCode = this._document.createTextNode(content);
    renderer.appendChild(script, scriptCode);

    renderer.appendChild(this._document.head, script);
  }
}
