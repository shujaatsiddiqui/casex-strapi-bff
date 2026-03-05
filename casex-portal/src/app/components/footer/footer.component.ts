import { Component, Input } from '@angular/core';
import { DynamicBlock } from '../../services/content.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <div class="footer-inner">
      <p class="footer-text">{{ data.footerText }}</p>
    </div>
  `,
  styles: [`
    .footer-inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
      text-align: center;
    }
    .footer-text {
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.7);
      margin: 0;
    }
  `],
})
export class FooterComponent {
  @Input() data!: DynamicBlock;
}
