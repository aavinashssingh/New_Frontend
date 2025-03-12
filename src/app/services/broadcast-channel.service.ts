import { DOCUMENT } from "@angular/common";
import { Inject, Injectable, inject } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, Subject, filter } from "rxjs";
interface BroadcastMessage {
  type: string;
  payload: any;
}
@Injectable({
  providedIn: "root",
})
export class BroadcastChannelService {
  constructor(@Inject(DOCUMENT) public document: any) {}
  private broadcastChannel: BroadcastChannel;
  private onMessage = new Subject<any>();
  private router = inject(Router);
  oBroadCast(channelName: string) {
    this.broadcastChannel = new BroadcastChannel(channelName);
    this.broadcastChannel.onmessage = (message: any) => {
      const { type, payload } = message.data;
      if (type == "logout") {
        this.document.location.reload();
        return;
      }
      this.onMessage.next(message.data);
    };
  }
  publisMessage(message: BroadcastMessage) {
    this.broadcastChannel?.postMessage(message);
  }
  getMessage(type: string): Observable<BroadcastMessage> {
    return this.onMessage.pipe(filter((message) => message.type == type));
  }
}
