import { Pipe, PipeTransform } from "@angular/core";
import { Observable, of } from "rxjs";

@Pipe({
  name: "replace",
})
export class ReplacePipe implements PipeTransform {
  transform(
    value: string,
    replace: string,
    replaceWith: string
  ): Observable<string> {
    if (value) {
      return of(value.replace(replace, replaceWith));
    }
    return null;
  }
}
