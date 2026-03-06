export interface StrapiMedia {
  id: number;
  name: string;
  alternativeText: string | null;
  url: string;
  width: number;
  height: number;
  formats?: {
    large?: { url: string; width: number; height: number };
    medium?: { url: string; width: number; height: number };
    small?: { url: string; width: number; height: number };
    thumbnail?: { url: string; width: number; height: number };
  };
}

export interface DynamicBlock {
  __component: string;
  id: number;
  // menu.menu
  Active?: boolean;
  Path?: string;
  Name?: string;
  SubMenu?: DynamicBlock[];
  // banner.banner
  MainHeading?: string;
  Caption?: string;
  Description?: string;
  RegisterButtonName?: string;
  FileFormButtonName?: string;
  FileFormButtonLink?: string;
  Banner?: StrapiMedia;
  // gallery.gallery
  media_gallery?: StrapiMedia[];
  // footer.footer
  footerText?: string;
  // sections.hero-banner (legacy)
  ButtonLabelBeforeLogin?: string;
  // sections.image-gallery / sections.rich-text (legacy)
  Title?: string;
  Images?: StrapiMedia[];
  Content?: any[];
  [key: string]: any;
}

export interface PageData {
  id: number;
  documentId: string;
  Title: string;
  /**
   * All dynamic zones, keyed by field name.
   * Populated automatically by extractZones() — no hardcoded zone names needed.
   * Example: { dz_header: [...], dz_body: [...], dz_footer: [...] }
   */
  zones: Record<string, DynamicBlock[]>;
}
