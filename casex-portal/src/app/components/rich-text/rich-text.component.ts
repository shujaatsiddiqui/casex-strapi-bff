import { Component, Input } from '@angular/core';
import type { DynamicBlock } from '../../models/strapi.models';

@Component({
  selector: 'app-rich-text',
  standalone: true,
  templateUrl: './rich-text.component.html',
  styleUrl: './rich-text.component.css',
})
export class RichTextComponent {
  @Input() data!: DynamicBlock;
}
