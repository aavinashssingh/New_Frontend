import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "nectar-read-more",
  templateUrl: "./read-more.component.html",
  styleUrls: ["./read-more.component.scss"],
})
export class ReadMoreComponent implements OnInit {
  @Input() text: string;
  @Input() maxLength: number;
  @Input() type: string = null;

  truncatedText: string;
  showFullText = false;

  ngOnInit() {
    this.truncatedText = this.text?.slice(0, this.maxLength);
  }

  toggleReadMore() {
    this.showFullText = !this.showFullText;
  }
}
