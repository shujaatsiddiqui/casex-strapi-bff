import { Component, Input } from '@angular/core';
import { HomePageSection } from '../../services/strapi.service';

@Component({
  selector: 'app-home-section',
  standalone: true,
  template: `
    <article class="section-card">
      <h3>{{ data.Title }}</h3>
      @if (data.Short_description) {
        <p class="short-desc">{{ data.Short_description }}</p>
      }
    </article>
  `,
  styles: [`
    .section-card {
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      margin-bottom: 2rem;
      border-left: 4px solid #e94560;
    }
    h3 {
      color: #1a1a2e;
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }
    .short-desc {
      color: #555;
      line-height: 1.7;
      font-size: 1rem;
      margin: 0;
    }
  `],
})
export class HomeSectionComponent {
  @Input() data!: HomePageSection;
}
