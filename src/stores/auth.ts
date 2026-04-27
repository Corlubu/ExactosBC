import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type AuthStore = {
  authToken: string | null;
  setAuthToken: (token: string) => void;
  clearAuthToken: () => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      authToken: null,
      setAuthToken: (token: string) => set({ authToken: token }),
      clearAuthToken: () => set({ authToken: null }),
    }),
    {
      name: "assetmaster-auth",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
