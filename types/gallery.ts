export interface Gallery {
  _id: string;
  familyId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface Album {
  _id: string;
  name: string;
  galleryId: string;
  coverImage?: string;
  description?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface Media {
  _id: string;
  galleryId: string;
  albumId?: string | null;
  uploadedBy: string;
  type: 'image' | 'video';
  url: string;
  caption?: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface GalleryData {
  gallery: Gallery;
  albums: Album[];
  media: Media[];
}

export interface GalleryResponse {
  success: boolean;
  message: string;
  data?: GalleryData;
  error?: string;
}

export interface CreateGalleryResponse {
  success: boolean;
  message: string;
  data?: Gallery;
  error?: string;
}

export interface CreateAlbumRequest {
  galleryId: string;
  name: string;
  coverImage: string;
  description: string;
}

export interface CreateAlbumResponse {
  success: boolean;
  message: string;
  data?: Album;
  error?: string;
}
