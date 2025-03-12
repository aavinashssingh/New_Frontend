import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: "nectar-support-modal",
  templateUrl: "./support-modal.component.html",
  styleUrls: ["./support-modal.component.scss"],
})
export class SupportModalComponent {
  constructor(public matdialogRef: MatDialogRef<SupportModalComponent>) {}

  copyText(value: string) {
    navigator.clipboard.writeText(value).then(
      () => {
        /* Resolved - text copied to clipboard successfully */
      },
      () => {
        /* Rejected - text failed to copy to the clipboard */
      }
    );
    // navigator.permissions
    //   .query({ name: "write-on-clipboard" as PermissionName })
    //   .then((result) => {
    //     if (result.state == "granted" || result.state == "prompt") {
    //       alert("Write access granted!");
    //     }

    //   });
  }
}
