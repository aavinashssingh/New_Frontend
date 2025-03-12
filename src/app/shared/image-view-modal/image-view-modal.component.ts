import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: "nectar-image-view-modal",
  templateUrl: "./image-view-modal.component.html",
  styleUrls: ["./image-view-modal.component.scss"],
})
export class ImageViewModalComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ImageViewModalComponent>
  ) {}
  ngOnInit(): void {}

  onNoClick(): void {
    this.dialogRef.close(false);
  }
}
