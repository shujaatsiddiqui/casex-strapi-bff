import { Component, Input } from '@angular/core';
import { DynamicBlock } from '../../services/content.service';

@Component({
  selector: 'app-rich-text',
  standalone: true,
  templateUrl: './rich-text.component.html',
  styles: [`
    .rich-text { padding: 2rem; margin-bottom: 2rem; }
    h2 { color: #1a1a2e; margin-bottom: 1rem; }
    p { color: #555; line-height: 1.7; margin-bottom: 1rem; }
    ul { color: #555; line-height: 1.7; padding-left: 1.5rem; }
  `],
})
export class RichTextComponent {
  @Input() data!: DynamicBlock;
}
