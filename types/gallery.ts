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
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface Media {
  _id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  albumId?: string;
  galleryId: string;
  uploadedBy: string;
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
