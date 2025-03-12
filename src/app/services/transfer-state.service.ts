import { Injectable, PLATFORM_ID, Inject } from "@angular/core";
import {
  TransferState,
  makeStateKey,
  StateKey,
} from "@angular/core";
import { isPlatformServer } from "@angular/common";
import { tap, of, Observable } from "rxjs";

export const FROM_LITTLE_TO_CRITICAL_ISSUES_KEY: StateKey<string> =
  makeStateKey("FROM_LITTLE_TO_CRITICAL_ISSUES");
export const TOP_RATED_KEY: StateKey<string> = makeStateKey("TOP_RATED");
export const HOME_BLOG_KEY: StateKey<string> = makeStateKey("HOME_BLOG");
export const FAQ_NON_TYPE_KEY: StateKey<string> = makeStateKey("FAQ_NON_TYPE");
export const FAQ_SURGERY_TYPE_KEY: StateKey<string> =
  makeStateKey("FAQ_SURGERY_TYPE");
export const DOCTOR_DETAILS_KEY = (id: string): StateKey<string> =>
  makeStateKey(`DOCTOR_DETAILS-${id}`);

@Injectable({
  providedIn: "root",
})
export class TransferStateService {

  private isServer = false;

  constructor(
    private tstate: TransferState,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isServer = isPlatformServer(platformId);
  }

  checkAndGetData(
    key: StateKey<string>,
    getDataObservable: Observable<any>,
    defaultValue: any = []
  ) {
    if (this.tstate.hasKey(key)) return of(this.tstate.get(key, defaultValue));

    return getDataObservable.pipe(
      tap((data) => {
        if (this.isServer) {
          this.tstate.set(key, data);
        }
      })
    );
  }

  getDynamicStateKey(key: string) {
    return makeStateKey(key);
  }
}
