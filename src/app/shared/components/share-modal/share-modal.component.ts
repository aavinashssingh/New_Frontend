import { DOCUMENT } from "@angular/common";
import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "nectar-share-modal",
  templateUrl: "./share-modal.component.html",
  styleUrls: ["./share-modal.component.scss"],
})
export class ShareModalComponent {
  constructor(
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    @Inject(DOCUMENT) public document: any
  ) {}
  url: any = this.document.location.href;
  iconArray = [
    "assets/images/svg/whatsapp.svg",
    "assets/images/svg/mail.svg",
    "assets/images/svg/facebook.svg",
    "assets/images/svg/linkdn.svg",
    "assets/images/twitter.svg",
    "assets/images/svg/pinterest.svg",
  ];

  copyText(value: string) {
    navigator.clipboard.writeText(value).then(
      () => {
        this.toastr.success("Link copied successfully!");
        /* Resolved - text copied to clipboard successfully */
      },
      () => {
        console.error("Failed to copy");
        /* Rejected - text failed to copy to the clipboard */
      }
    );
  }
}
