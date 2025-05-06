import { create } from "zustand";

export const useModelStore = create<{
  model: string;
  setModel: (model: string) => void;
}>((set) => ({
  model: "meta-llama/Llama-3.3-70B-Instruct",
  setModel: (model) => set({ model }),
}));

export const useChatId = create<{
  id: string | null,
  setId: (id: string) => void
}>((set) => ({
  id: null,
  setId: (id) => set({id})
}))