import { Component, Input } from '@angular/core';
import { DynamicBlock } from '../../services/content.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-unknown-block',
  standalone: true,
  template: `
    @if (!isProd) {
      <div class="unknown-block">
        <span class="unknown-block__icon">&#9888;</span>
        <span>
          No Angular component registered for Strapi type
          <code>{{ data.__component }}</code>.
          Add it to <code>BLOCK_REGISTRY</code> in
          <code>dynamic-zone.component.ts</code>.
        </span>
      </div>
    }
  `,
  styles: [`
    .unknown-block {
      display: flex;
      align-items: flex-start;
      gap: 0.6rem;
      margin: 0.75rem 1rem;
      padding: 0.85rem 1rem;
      border: 2px dashed #f59e0b;
      border-radius: 8px;
      background: #fffbeb;
      color: #92400e;
      font-size: 0.85rem;
      line-height: 1.5;
    }
    .unknown-block__icon { font-size: 1rem; flex-shrink: 0; }
    code {
      background: rgba(0,0,0,.07);
      border-radius: 3px;
      padding: 0.1em 0.35em;
      font-size: 0.9em;
    }
  `],
})
export class UnknownBlockComponent {
  @Input() data!: DynamicBlock;
  readonly isProd = environment.production;
}
