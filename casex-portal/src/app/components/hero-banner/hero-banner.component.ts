import { Component, Input, OnChanges } from '@angular/core';
import { DynamicBlock } from '../../services/content.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-hero-banner',
  standalone: true,
  templateUrl: './hero-banner.component.html',
  styles: [`
    /* ── Hero shell ── */
    .hero {
      position: relative;
      min-height: 520px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      background: linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary-mid) 50%, var(--color-primary) 100%);
      color: var(--color-white);
      text-align: center;
      padding: 6rem 2rem;
    }

    /* ── Background image layer ── */
    .hero-image-wrapper {
      position: absolute;
      inset: 0;
      z-index: 0;
    }
    .hero-bg-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      opacity: 0.35;
    }

    /* dark gradient over the image for legibility */
    .hero::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to bottom,
        rgba(15,52,96,.55) 0%,
        rgba(26,26,46,.80) 100%
      );
      z-index: 1;
    }

    /* ── Content ── */
    .hero-content {
      position: relative;
      z-index: 2;
      max-width: 780px;
      width: 100%;
      animation: fadeUp .6s ease both;
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    h1 {
      font-size: clamp(2rem, 5vw, 3.2rem);
      font-weight: 800;
      line-height: 1.15;
      letter-spacing: -0.5px;
      margin-bottom: 1rem;
      text-shadow: 0 2px 8px rgba(0,0,0,.4);
    }

    .caption {
      font-size: clamp(1rem, 2.5vw, 1.25rem);
      font-weight: 500;
      opacity: 0.92;
      margin-bottom: 0.75rem;
      line-height: 1.5;
    }

    .description {
      font-size: 1rem;
      opacity: 0.78;
      max-width: 560px;
      margin: 0 auto 2.5rem;
      line-height: 1.7;
    }

    /* ── Action buttons ── */
    .hero-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn {
      display: inline-block;
      padding: 0.75rem 2rem;
      border-radius: 50px;
      font-weight: 600;
      font-size: 0.95rem;
      letter-spacing: 0.3px;
      text-decoration: none;
      cursor: pointer;
      transition: transform var(--transition), box-shadow var(--transition), background var(--transition), opacity var(--transition);
    }

    .btn-primary {
      background: var(--color-accent);
      color: var(--color-white);
      border: 2px solid var(--color-accent);
      box-shadow: 0 4px 18px rgba(233,69,96,.45);
    }
    .btn-primary:hover {
      background: var(--color-accent-dark);
      border-color: var(--color-accent-dark);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(233,69,96,.55);
    }

    .btn-secondary {
      background: rgba(255,255,255,.12);
      color: var(--color-white);
      border: 2px solid rgba(255,255,255,.7);
      backdrop-filter: blur(4px);
    }
    .btn-secondary:hover {
      background: rgba(255,255,255,.22);
      border-color: var(--color-white);
      transform: translateY(-2px);
    }

    /* ── Responsive ── */
    @media (max-width: 600px) {
      .hero { padding: 5rem 1.25rem; min-height: 420px; }
      .hero-actions { flex-direction: column; align-items: center; }
      .btn { width: 100%; max-width: 280px; text-align: center; }
    }
  `],
})
export class HeroBannerComponent implements OnChanges {
  @Input() data!: DynamicBlock;
  bannerImageUrl: string | null = null;

  ngOnChanges(): void {
    const url = this.data?.Banner?.url;
    if (url) {
      this.bannerImageUrl = url.startsWith('http') ? url : `${environment.strapiUrl}${url}`;
    } else {
      this.bannerImageUrl = null;
    }
  }
}
