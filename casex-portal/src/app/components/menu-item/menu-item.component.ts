import { Component, Input } from '@angular/core';
import { DynamicBlock } from '../../services/content.service';

@Component({
  selector: 'app-menu-item',
  standalone: true,
  imports: [],
  template: `
    @if (data.Active !== false) {
      <nav class="nav-item" [class.has-submenu]="hasSubmenu">
        <a class="nav-link" [href]="data.Path || '#'">{{ data.Name }}</a>

        @if (hasSubmenu) {
          <ul class="submenu">
            @for (sub of data.SubMenu; track sub.id) {
              @if (sub.Active !== false) {
                <li>
                  <a class="submenu-link" [href]="sub.Path || '#'">{{ sub.Name }}</a>
                </li>
              }
            }
          </ul>
        }
      </nav>
    }
  `,
  styles: [`
    .nav-item {
      position: relative;
      display: inline-block;
    }

    .nav-link {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.5rem 1rem;
      color: #000;
      text-decoration: none;
      font-size: 0.95rem;
      font-weight: 500;
      border-radius: var(--radius-sm);
      transition: background var(--transition), color var(--transition);
    }
    .nav-link:hover {
      background: rgba(0, 0, 0, 0.08);
      color: #000;
    }

    /* Dropdown indicator */
    .has-submenu .nav-link::after {
      content: '▾';
      font-size: 0.75rem;
      opacity: 0.75;
    }

    /* Submenu */
    .submenu {
      display: none;
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      min-width: 180px;
      list-style: none;
      margin: 0;
      padding: 0.4rem 0;
      background: #fff;
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      z-index: 100;
    }
    .nav-item:hover .submenu,
    .nav-item:focus-within .submenu {
      display: block;
    }

    .submenu-link {
      display: block;
      padding: 0.5rem 1.1rem;
      color: #000;
      text-decoration: none;
      font-size: 0.9rem;
      transition: background var(--transition);
    }
    .submenu-link:hover {
      background: rgba(0, 0, 0, 0.06);
      color: #000;
    }
  `],
})
export class MenuItemComponent {
  @Input() data!: DynamicBlock;

  get hasSubmenu(): boolean {
    return Array.isArray(this.data.SubMenu) && this.data.SubMenu.length > 0;
  }
}
