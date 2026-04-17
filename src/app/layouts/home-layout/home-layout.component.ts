import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-home-layout',
  standalone: true,
  imports: [SidebarComponent, RouterOutlet],
  templateUrl: './home-layout.component.html'
})
export class HomeLayoutComponent { }
