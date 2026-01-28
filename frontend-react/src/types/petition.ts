export interface Author {
  name: string;
  nid?: string;
}

export interface PetitionDetails {
  id: string;
  slug: string;
  startDate: string;
  nameDhiv: string;
  nameEng: string;
  authorDetails: Author;
  petitionBodyDhiv: string;
  petitionBodyEng: string;
  signatureCount: number;
}

export interface SignatureSubmission {
  name: string;
  idCard: string;
  signature: string; // SVG string
  turnstileToken: string;
}

export type Language = "en" | "dv";
