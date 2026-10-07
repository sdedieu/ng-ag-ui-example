import { Component } from '@angular/core';
import { NavBar } from './nav-bar';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'page-layout',
  host: {
    class: 'flex flex-col',
  },
  template: ` <nav-bar />
    <main
      class="grow flex items-center justify-center min-h-[calc(100vh-40px)]"
    >
      <router-outlet />
    </main>`,
  imports: [NavBar, RouterOutlet],
})
export class PageLayout {}
