import { Component } from '@angular/core';
import { NavBar } from './nav-bar';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'page-layout',
  host: {
    class: 'flex flex-col',
  },
  template: ` <nav-bar class="mb-3" />
    <main class="px-3 grow">
      <router-outlet />
    </main>`,
  imports: [NavBar, RouterOutlet],
})
export class PageLayout {}
