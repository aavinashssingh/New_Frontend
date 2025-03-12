import { Injectable } from "@angular/core";
import { getTimeFromString } from "./helper.service";
import { environment } from "src/environments/environment";
@Injectable({
  providedIn: "root",
})
export class FormatTimeService {
  dateTimeConversion(data: any) {
    this.cleanUpEmptySlots(data);
    // let obj = {day: '', 1: , 2: ,3: };
    let modifiedArray: any = [];
    let arr = this.createObj(data);

    for (let i = 0; i < arr.length; i++) {
      if (arr.length == 0) {
        modifiedArray.push(arr[0]);
      } else {
        let j = 0;
        for (j; j < modifiedArray.length; j++) {
          if (
            modifiedArray[j]?.morning == arr[i]?.morning &&
            modifiedArray[j]?.afternoon == arr[i]?.afternoon &&
            modifiedArray[j]?.evening == arr[i]?.evening
          ) {
            modifiedArray[j].day = modifiedArray[j].day + " , " + arr[i].day;
            break;
          }
        }
        if (j == modifiedArray.length) {
          modifiedArray.push(arr[i]);
        }
      }
    }
    modifiedArray.forEach((x) => {
      this.matchDays(x);
    });
    return modifiedArray;
  }

  // Remove keys with empty or null values
  cleanUpEmptySlots(data: any) {
    for (const key in data) {
      if (!data[key] || !data[key].length) {
        delete data[key];
      }
    }
  }

  // creating object have day , morning time , eve time and noon time
  createObj(data: any) {
    let arr = [];
    Object.keys(data).forEach((x) => {
      let obj = { day: x, morning: "", afternoon: "", evening: "" };
      for (let i = 0; i < data[x]?.length; i++) {
        obj[data[x][i]["slot"]] = data[x][i]?.from + " to " + data[x][i]?.to;
      }
      arr.push(obj);
    });
    return arr;
  }

  // matching days => days having similar timing and concat them using ','

  matchDays(data: any) {
    const { morning, afternoon, evening } = data;
    if (afternoon && (afternoon || evening)) {
      const morningStartTime = morning.split("to")?.[0]?.trim();
      const morningEndTime = morning.split("to")?.[1]?.trim();
      const afternoonStartTime = afternoon.split("to")?.[0]?.trim();
      let afternoonEndTime = afternoon.split("to")?.[1]?.trim();
      const eveningStartTime = evening.split("to")?.[0]?.trim();
      const eveningEndTime = evening.split("to")?.[1]?.trim();
      // merging the afternoon and evening slot
      if (
        eveningStartTime &&
        afternoonEndTime &&
        getTimeFromString(eveningStartTime) -
          getTimeFromString(afternoonEndTime) ==
          environment.DOCTOR_SLOT_TIME
      ) {
        data.afternoon = afternoonStartTime + " to " + eveningEndTime;
        afternoonEndTime = eveningEndTime;
        delete data.evening;
      }
      // merging the morning and afternoon slot
      if (
        afternoonStartTime &&
        morningEndTime &&
        getTimeFromString(afternoonStartTime) -
          getTimeFromString(morningEndTime) ==
          environment.DOCTOR_SLOT_TIME
      ) {
        data.morning = morningStartTime + " to " + afternoonEndTime;
        delete data.afternoon;
      }
    }
    let days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
    let incoming = data?.day.split(" , ");
    if (incoming.length == 1 || incoming.length == 2) {
      return;
    } else {
      let index1 = days.indexOf(incoming[0]);
      let index2 = days.indexOf(incoming[incoming.length - 1]);
      if (index2 - index1 + 1 == incoming.length) {
        data.day = incoming[0] + " To " + incoming[incoming.length - 1];
      } else {
        return;
      }
    }
  }

  convertTo24HourFormat(startTime, endTime) {
    function convertTimeTo24HourFormat(time) {
      let [hh, mm, period] = time.split(/:| /);
      let hours = parseInt(hh);
      let minutes = parseInt(mm);

      if (period === "PM" && hours !== 12) {
        hours += 12;
      } else if (period === "AM" && hours === 12) {
        hours = 0;
      }

      return hours.toString().padStart(2, "0") + ":" + mm;
    }

    return (
      convertTimeTo24HourFormat(startTime) +
      "-" +
      convertTimeTo24HourFormat(endTime)
    );
  }
}
