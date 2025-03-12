import { Component } from "@angular/core";
import { CommonService } from "src/app/services/common.service";
// import { baseCarouselConfig } from "src/app/shared/constant/carousel-config.constants";


@Component({
  selector: "nectar-client-testimonials",
  templateUrl: "./client-testimonials.component.html",
  styleUrls: ["./client-testimonials.component.scss"],
})
export class ClientTestimonialsComponent {
  deviceWidth: any = 0;  // Default value to avoid undefined error
   slidesToShow:any=3
  constructor(    private commonService: CommonService,
  ){
    this.deviceWidth = this.commonService.gettingWinowWidth();
if(this.deviceWidth < 567){
  this.slidesToShow=1
}else{
  this.slidesToShow=3
}
this.updateSwiperConfig();  // Update swiperConfig after determining deviceWidth


  }
  apiData: any = [
    {
      patientImage: "assets/images/homepage/ramesh.svg",
      patientName: "Ramesh Singh",
      address: "Azadpur, Delhi",
      feedback:
        "I had to have surgery on my knee, and I was really worried about it. But my orthopedic surgeon was so reassuring. He explained everything to me in detail, and he made me feel confident in his abilities. I'm so glad I chose him.",
    },
    {
      patientImage: "assets/images/homepage/kamal.svg",
      patientName: "Kamal Sharma",
      address: "Saket, Delhi",
      feedback:
        "I had a root canal done at Dr. Harsh's clinic, and it was the best experience I've ever had at the dentist. The staff was so friendly and welcoming, and Dr. Harsh was incredibly skilled. I would definitely recommend him to anyone.",
    },
    {
      patientImage: "assets/images/homepage/shivam.svg",
      patientName: "Shivam Kumar",
      address: "Kirti Nagar, Delhi",
      feedback:
        "Dr. Rakesh is an oncologist who is truly compassionate. He took the time to answer all of my questions and concerns, and he made me feel like she was truly invested in my care.",
    },
    {
      patientImage: "assets/images/homepage/praveen.svg",
      patientName: "Praveen",
      address: "Jaipur, Rajasthan",
      feedback:
        "I was very happy with the results of my treatment with my dermatologist. She was knowledgeable and up-to-date on the latest treatments.",
    },
    {
      patientImage: "assets/images/homepage/babita.svg",
      patientName: "Babita Kaur",
      address: "Punjab",
      feedback:
        "I was having some issues with my menstrual cycle, and I went to see a gynecologist. The gynecologist was so patient and understanding. She took the time to listen to my concerns, and she gave me some great advice. I'm so glad I went to see her.",
    },
    {
      patientImage: "assets/images/homepage/komal.svg",
      patientName: "Komal Singh",
      address: "Gurugram, Haryana",
      feedback:
        "My child has been seeing the same pediatrician since he was born, and I'm so glad we found her. She's always so kind and gentle with him, and she takes the time to explain things in a way that he can understand.",
    },
  ];


  swiperConfig: any = {};  // Initially empty

  updateSwiperConfig(): void {
    this.swiperConfig = {
      a11y: { enabled: true },
      speed: 300,
      autoplay: true,
      direction: "horizontal",
      navigation: true,
      autoHeight: true,
      keyboard: true,
      mousewheel: false,
      scrollbar: false,
      loop: true,
      lazy: true,
      preloadImages: false,
      watchSlidesVisibility: true,
      slidesPerView: this.slidesToShow,
      spaceBetween: 20,
      pagination: { clickable: true },
    };
  }
  

  
}
