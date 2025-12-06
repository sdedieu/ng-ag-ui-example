import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'nav-bar',
  template: `
    <nav class="px-3 bg-gray-100 ">
      <ul class="flex items-center">
        @for (link of links; track link.route) {
        <li
          class="py-2 px-3 cursor-pointer"
          [routerLink]="link.route"
          routerLinkActive="bg-gray-50 text-gray-500"
        >
          {{ link.label }}
        </li>
        }
      </ul>
    </nav>
  `,
  imports: [RouterLink, RouterLinkActive],
})
export class NavBar {
  links = [
    { route: '/home', label: 'Home' },
    { route: '/settings', label: 'Settings' },
  ];
}
