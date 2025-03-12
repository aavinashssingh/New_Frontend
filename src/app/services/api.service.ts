import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { LocalStorageService } from "./storage.service";
import { API_ENDPOINTS } from "../config/api.constant";
import { ToastrService } from "ngx-toastr";
import { EventService } from "./event.service";

@Injectable({
  providedIn: "root",
})
export class ApiService {
  constructor(
    private router: Router,
    private http: HttpClient,
    private localStorage: LocalStorageService,
    private toastr: ToastrService,
    private eventService: EventService
  ) { }
  acceptedFileType = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
  ];
  post(path: string, data: any): Observable<any> {
    return this.http.post(path, data);
  }

  postParams(path: string, body: any, params: any): Observable<any> {
    let param = new HttpParams(params);
    param = param.appendAll(params);
    return this.http.post(path, body, { params: param });
  }

  get(path: string, payload: any): Observable<any> {
    let params = new HttpParams();
    params = params.appendAll(payload);

    return this.http.get(`${path}`, { params: params }).pipe();
  }

  delete(path: string, id: any): Observable<any> {
    return this.http.delete(`${path + "/" + id}`);
  }
  deleteAccount(path: string): Observable<any> {
    return this.http.delete(path);
  }
  put(path: string, data: any): Observable<any> {
    return this.http.put(path, data);
  }

  patch(path: string, data: any): Observable<any> {
    return this.http.patch(path, data);
  }
  patchParams(path: string, data: any, payload: any): Observable<any> {
    let params = new HttpParams();
    params = params.appendAll(payload);
    return this.http.patch(path, data, { params });
  }
  deleteMultiple(path: string, data: any): Observable<any> {
    return this.http.delete(path, {
      params: data,
    });
  }
  getPayload(path: string, payload: any) {
    return this.http.get(path, payload);
  }
  putSetting(path: string, data: any, payload: any): Observable<any> {
    let params = new HttpParams();
    params = params.appendAll(payload);
    return this.http.put(path, data, { params: params });
  }
  deleteSetting(path: string, param: any) {
    let params = new HttpParams();
    params = params.appendAll(param);
    return this.http.delete(path, { params: params });
  }

  logout() {
    this.http.post(API_ENDPOINTS.auth.logout, {}).subscribe((res: any) => {
      this.localStorage.removeAllItem();
      this.router.navigateByUrl("", { replaceUrl: true });
      this.eventService.broadcastEvent("login", false);
    });
  }
  fileUpload(file) {
    const formData = new FormData();
    if (!this.acceptedFileType.includes(file.type)) {
      this.toastr.error("Please upload file in pdf, jpeg, jpg or png format");
      throw new Error("wrong file format");
    }
    formData.append("file", file);
    return this.http.post(API_ENDPOINTS.COMMON.fileupload, formData);
  }
  importFile(file) {
    if (file.type != "text/csv") {
      this.toastr.error("Please upload file in csv format.");
      return null;
    }
    const formData = new FormData();
    formData.append("file", file);
    return this.http.post(API_ENDPOINTS.COMMON.importDoctor, formData);
  }
  putParams(path: string, payload: any, paramsdata: any) {
    let params = new HttpParams();
    params = params.appendAll(paramsdata);
    return this.http.put(path, payload, { params });
  }
  delteParams(path: string, payload: any) {
    let params = new HttpParams();
    params = params.appendAll(payload);
    return this.http.delete(path, { params });
  }
  saveAndExit(payload) {
    this.http.put(API_ENDPOINTS.doctor.updateProfile, payload).subscribe({
      next: (res: any) => {
        this.router.navigate(["/"]);
        const keys = [
          "sectionA",
          "sectionB",
          "sectionC",
          "steps",
          "isEdit",
          "token",
          "userType",
          "isLogged",
        ];
        this.eventService.broadcastEvent("showheader", "normalheader");
        this.eventService.broadcastEvent("footer", "normal");
        this.clearLocalStorage(keys);
      },
      error: (error: any) => {
        console.log(error);
      },
    });
  }
  clearLocalStorage(keys: string[]) {
    keys.forEach((value: string) => {
      this.localStorage.removeItem(value);
    });
  }
  saveAndExitHospital(payload) {
    this.http.put(API_ENDPOINTS.hospital.updateProfile, payload).subscribe({
      next: (res: any) => {
        this.router.navigate(["/"]);
        const keys = [
          "sectionA",
          "sectionB",
          "sectionC",
          "steps",
          "isEdit",
          "token",
          "userType",
          "isLogged",
        ];
        this.eventService.broadcastEvent("showheader", "normalheader");
        this.eventService.broadcastEvent("footer", "normal");
        this.clearLocalStorage(keys);
      },
      error: (error: any) => {
        console.log(error);
      },
    });
  }

  searchSuggestions(key: string) {
    const request = {
      url: API_ENDPOINTS.patient.getSearchSuggestion,
    };
    return this.http.get<any>(request.url, {
      params: { search: key },
    });
  }

  sitemap() {
    const request = {
      url: API_ENDPOINTS.COMMON.getSitemap,
    };
    return this.http.get<any>(request.url);
  }

  getPopularBlogs() {
    let url = `https://blog.nectarplus.health/wp-json/wordpress-popular-posts/v1/popular-posts?range=last30days&limit=10&_embed=wp:term`;
    return this.http.get<any>(url);
  }

  getCategory(id: any) {
    let url = `https://blog.nectarplus.health/wp-json/wp/v2/categories?post=${id}`;
    return this.http.get<any>(url);
  }

  getCitiesByCountry(country: string): Observable<any> {
    const url = 'https://countriesnow.space/api/v0.1/countries/cities';
    const body = new HttpParams().set('country', country);
    return this.http.post(url, body.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  }
  getstatesByCountry(state: string): Observable<any> {
    const url = 'https://countriesnow.space/api/v0.1/countries/states';
    const body = new HttpParams().set('country', state);
    return this.http.post(url, body.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  }

}
