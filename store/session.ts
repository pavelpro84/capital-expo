import { create } from "zustand";

type SessionState = {
  token: string | null;
  url: string;
  setToken: (token: string) => void;
  setUrl: (url: string) => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  token: null,
  url: "https://test.capital.glasshouseventure.studio/api/prism",
  setToken: (token) => set({ token }),
  setUrl: (url) => set({ url }),
}));
