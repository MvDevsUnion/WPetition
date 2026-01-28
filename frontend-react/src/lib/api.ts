import type { PetitionDetails, SignatureSubmission } from "@/types/petition";

// API base URL - empty for same-origin requests through Vite proxy
const API_BASE_URL = "";

export async function fetchPetition(
  petitionId: string,
): Promise<PetitionDetails> {
  const response = await fetch(
    `${API_BASE_URL}/api/Sign/petition/${petitionId}`,
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function fetchPetitionBySlug(
  slug: string,
): Promise<PetitionDetails> {
  const response = await fetch(
    `${API_BASE_URL}/api/Sign/petition/by-slug/${slug}`,
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export interface PetitionFormData {
  slug: string;
  nameDhiv: string;
  nameEng: string;
  startDate: string; // dd-MM-yyyy
  authorName: string;
  authorNid: string;
  petitionBodyDhiv: string;
  petitionBodyEng: string;
}

export interface SubmitPetitionResponse {
  message: string;
  petitionId: string;
  slug: string;
  fileName: string;
  filePath: string;
  authorId: string;
}

export async function submitPetition(
  data: PetitionFormData,
): Promise<SubmitPetitionResponse> {
  const formData = new FormData();
  formData.append("Slug", data.slug);
  formData.append("NameDhiv", data.nameDhiv);
  formData.append("NameEng", data.nameEng);
  formData.append("StartDate", data.startDate);
  formData.append("AuthorName", data.authorName);
  formData.append("AuthorNid", data.authorNid);
  formData.append("PetitionBodyDhiv", data.petitionBodyDhiv);
  formData.append("PetitionBodyEng", data.petitionBodyEng);

  const response = await fetch(
    `${API_BASE_URL}/api/Debug/upload-petition-form`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function submitSignature(
  petitionId: string,
  submission: SignatureSubmission,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/Sign/petition/${petitionId}`,
    {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(submission),
    },
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
}

// Dummy petition for development when API is not available
export function getDummyPetition(slug: string): PetitionDetails {
  return {
    id: "dev-petition-id",
    slug: slug || "demo-petition",
    nameEng: "Demo Petition: Improve Local Services",
    nameDhiv: "Demo Petition",
    startDate: new Date().toLocaleDateString(),
    signatureCount: 42,
    authorDetails: {
      name: "Demo Author",
    },
    petitionBodyEng:
      "This is dummy petition content to enable local development. Replace with real data when the API is available.",
    petitionBodyDhiv: "Demo petition content (Dhivehi)",
  };
}
