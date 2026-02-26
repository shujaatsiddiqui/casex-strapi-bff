import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-text-block',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="text-block">
      <h2 *ngIf="data?.Title">{{ data.Title }}</h2>
      <div class="content" *ngIf="data?.Content">
        <ng-container *ngFor="let block of data.Content">
          <p *ngIf="block.type === 'paragraph'">
            <ng-container *ngFor="let child of block.children">
              <strong *ngIf="child.bold; else normalText">{{ child.text }}</strong>
              <ng-template #normalText>{{ child.text }}</ng-template>
            </ng-container>
          </p>
          <h1 *ngIf="block.type === 'heading' && block.level === 1">
            <ng-container *ngFor="let child of block.children">{{ child.text }}</ng-container>
          </h1>
          <h2 *ngIf="block.type === 'heading' && block.level === 2">
            <ng-container *ngFor="let child of block.children">{{ child.text }}</ng-container>
          </h2>
          <ul *ngIf="block.type === 'list' && block.format === 'unordered'">
            <li *ngFor="let item of block.children">
              <ng-container *ngFor="let child of item.children">{{ child.text }}</ng-container>
            </li>
          </ul>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    .text-block {
      margin-bottom: 2rem;
      padding: 1rem;
    }
    h2 {
      color: #333;
      margin-bottom: 1rem;
    }
    .content p {
      line-height: 1.6;
      color: #555;
    }
  `],
})
export class TextBlockComponent {
  @Input() data: any;
}
