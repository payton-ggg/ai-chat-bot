import { create } from "zustand";

export const useModelStore = create<{
  model: string;
  setModel: (model: string) => void;
}>((set) => ({
  model: "meta-llama/Llama-3.3-70B-Instruct",
  setModel: (model) => set({ model }),
}));
