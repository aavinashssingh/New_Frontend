import { Component, Renderer2 } from "@angular/core";
import { Router } from "@angular/router";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { LocalStorageService } from "src/app/services/storage.service";

@Component({
  selector: "nectar-doctor-delete-account",
  templateUrl: "./doctor-delete-account.component.html",
  styleUrl: "./doctor-delete-account.component.scss",
})
export class DoctorDeleteAccountComponent {
  //custom js start
  constructor(private renderer: Renderer2,
    private apiService: ApiService,
    private localstorage: LocalStorageService,
    private route: Router
  ) {

  }

  openModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      modalElement.classList.add("show", "d-block");
      modalElement.setAttribute("aria-modal", "true");
      modalElement.setAttribute("role", "dialog");


    }
  }

  closeModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      modalElement.classList.remove("show", "d-block");
      modalElement.removeAttribute("aria-modal");
      modalElement.removeAttribute("role");
    }

  }

  submitForm() {
    let id = this.localstorage.getItem("findUserId");
    let param = {
      id: id,
    };

    this.apiService
      .putSetting(API_ENDPOINTS.doctor.deleteDoctor, "", param)
      .subscribe((res: any) => {
        if (res?.success) {
          this.route.navigate(["/"]);
          this.localstorage.removeAllItem();
        }
      });
  }

 onMenuClick() {
    const sideMenu = document.getElementById("sideMenu");
    const innerArea = document.getElementById("clickToCloseArea");
    if (sideMenu) {
      if (sideMenu.classList.contains("mobileMenu") && innerArea.classList.contains("openedSideBar")  ) {
        this.renderer.removeClass(sideMenu, "mobileMenu");
        this.renderer.removeClass(innerArea, "openedSideBar");


      } else {
        this.renderer.addClass(sideMenu, "mobileMenu");
        this.renderer.addClass(innerArea, "openedSideBar");
      }
    }
  }

  closeSideBar(){
    const innerArea = document.getElementById("clickToCloseArea");
    const sideMenu = document.getElementById("sideMenu");
  if (innerArea.classList.contains("openedSideBar")) {
    this.renderer.removeClass(innerArea, "openedSideBar");
    this.renderer.removeClass(sideMenu, "mobileMenu");

  } 

  }


  onCloseMenuClick() {
    const sideMenu = document.getElementById("sideMenu");

    if (sideMenu && sideMenu.classList.contains("mobileMenu")) {
      this.renderer.removeClass(sideMenu, "mobileMenu");
    }
  }
  // toggle side menu sub menu
  toggleSubmenu(event: Event): void {
    event.preventDefault(); // Prevent the default action of the anchor tag

    const target = event.currentTarget as HTMLElement;
    const submenu = target.nextElementSibling as HTMLElement;





    if (submenu) {
      // Toggle the visibility of the submenu
      submenu.style.display =
        submenu.style.display === "block" ? "none" : "block";

      // Optionally hide other submenus if needed
      const allSubmenus = document.querySelectorAll(".submenu");
      allSubmenus.forEach((sm) => {
        if (sm !== submenu) {
          (sm as HTMLElement).style.display = "none";
        }
      });
    }
  }
  //custom js end
}

