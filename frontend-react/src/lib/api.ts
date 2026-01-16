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
export function getDummyPetition(petitionId: string): PetitionDetails {
  return {
    id: petitionId || "dev-petition",
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
