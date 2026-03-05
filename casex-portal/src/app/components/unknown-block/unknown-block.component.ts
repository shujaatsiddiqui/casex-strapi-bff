import { Component, Input } from '@angular/core';
import { DynamicBlock } from '../../services/content.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-unknown-block',
  standalone: true,
  templateUrl: './unknown-block.component.html',
  styleUrl: './unknown-block.component.css',
})
export class UnknownBlockComponent {
  @Input() data!: DynamicBlock;
  readonly isProd = environment.production;
}
