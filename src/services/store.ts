import { create } from "zustand";

export const useModelStore = create<{
	model: string;
	setModel: (model: string) => void;
}>((set) => ({
	model: "gpt-3.5-turbo",
	setModel: (model) => set({ model }),
}));
