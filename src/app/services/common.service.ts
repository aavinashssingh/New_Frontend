import { DOCUMENT, isPlatformBrowser } from "@angular/common";
import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import slugify from "slugify";

@Injectable({
  providedIn: "root",
})
export class CommonService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private _document: Document
  ) { }
  replaceSpaceWithHyphen(str: string = "") {
    return slugify(str, {
      lower: true,
      remove: undefined,
      strict: true,
    });
  }

  replaceHyphenWithSpace(str: string = "") {
    return str.split("-").join(" ");
  }

  titleCase(str: any = "") {
    return str
      .toLowerCase()
      .split(" ")
      .map(function (word) {
        return word.replace(word[0], word[0]?.toUpperCase());
      })
      .join(" ");
  }

  gettingWinowWidth() {
    return typeof window !== "undefined" ? window.innerWidth : 1440
  }
}
