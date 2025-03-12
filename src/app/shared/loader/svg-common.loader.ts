import { HttpClient } from "@angular/common/http";

import { SvgServerLoader } from "./svg-server.loader";
import { SvgBrowserLoader } from "./svg-browser.loader";
import { isPlatformServer } from "@angular/common";
import { TransferState } from "@angular/core";

export function svgLoaderFactory(
  http: HttpClient,
  transferState: TransferState,
  platformId: any
): SvgServerLoader | SvgBrowserLoader {
  if (isPlatformServer(platformId)) {
    return new SvgServerLoader("../browser/assets/images/svg", transferState);
  } else {
    return new SvgBrowserLoader(http, transferState);
  }
}
