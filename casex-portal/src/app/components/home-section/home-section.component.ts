import { Component, Input } from '@angular/core';
import { HomePageSection } from '../../services/strapi.service';

@Component({
  selector: 'app-home-section',
  standalone: true,
  templateUrl: './home-section.component.html',
  styleUrl: './home-section.component.css',
})
export class HomeSectionComponent {
  @Input() data!: HomePageSection;
}
