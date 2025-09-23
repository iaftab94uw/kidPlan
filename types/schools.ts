// Schools Types

export interface SchoolAddress {
  street: string;
  locality: string;
  address3: string;
  town: string;
  county: string;
  postcode: string;
}

export interface SchoolContact {
  head: {
    title: string;
    firstName: string;
    lastName: string;
  };
  web: string;
  tel: string;
}

export interface SchoolEvent {
  name: string;
  startDate: string;
  endDate: string;
  _id: string;
}

export interface SchoolHoliday {
  name: string;
  startDate: string;
  endDate: string;
  _id: string;
}

export interface SchoolLocation {
  type: string;
  coordinates: number[];
}

export interface School {
  _id: string;
  la: string; // Local Authority
  name: string;
  type: string;
  address: SchoolAddress;
  contact: SchoolContact;
  location: SchoolLocation;
  lat: number;
  lng: number;
  events: SchoolEvent[];
  holidays: SchoolHoliday[];
  syncedToCalendar: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface SchoolsListingResponse {
  success: boolean;
  message: string;
  data: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    schools: School[];
  };
}

export interface SchoolsListingParams {
  page?: number;
  limit?: number;
  search?: string;
  postcode?: string;
  miles?: number;
}


