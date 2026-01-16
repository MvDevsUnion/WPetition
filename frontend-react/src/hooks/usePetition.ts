import { useState, useEffect, useCallback } from "react";
import type { PetitionDetails } from "@/types/petition";
import { fetchPetition, getDummyPetition } from "@/lib/api";

interface UsePetitionResult {
  petition: PetitionDetails | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePetition(petitionId: string | null): UsePetitionResult {
  const [petition, setPetition] = useState<PetitionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPetition = useCallback(async () => {
    if (!petitionId) {
      setLoading(false);
      setError("No petition ID provided");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchPetition(petitionId);
      setPetition(data);
    } catch (err) {
      console.warn(
        "Failed to fetch petition, falling back to dummy data.",
        err,
      );
      // Use dummy data for development
      setError(
        "Failed to load petition from server — showing dummy data for development.",
      );
      setPetition(getDummyPetition(petitionId));
    } finally {
      setLoading(false);
    }
  }, [petitionId]);

  useEffect(() => {
    loadPetition();
  }, [loadPetition]);

  return {
    petition,
    loading,
    error,
    refetch: loadPetition,
  };
}
