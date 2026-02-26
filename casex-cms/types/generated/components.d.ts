import type { Schema, Struct } from '@strapi/strapi';

export interface GalleryGallery extends Struct.ComponentSchema {
  collectionName: 'components_gallery_galleries';
  info: {
    displayName: 'Gallery';
  };
  attributes: {
    Picture: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    Title: Schema.Attribute.String;
  };
}

export interface TextBlockTextBlock extends Struct.ComponentSchema {
  collectionName: 'components_text_block_text_blocks';
  info: {
    displayName: 'Text-Block';
  };
  attributes: {
    Content: Schema.Attribute.Blocks;
    Title: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'gallery.gallery': GalleryGallery;
      'text-block.text-block': TextBlockTextBlock;
    }
  }
}
