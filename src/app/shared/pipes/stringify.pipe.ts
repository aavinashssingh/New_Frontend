import { Pipe, PipeTransform } from "@angular/core";
import { Observable, of } from "rxjs";

@Pipe({
  name: "stringify",
})
export class StringifyPipe implements PipeTransform {
  transform(value: any): Observable<string> {
    return value ? of(JSON.stringify(value)) : null;
  }
}
