import { createContext, type PropsWithChildren, useContext, useMemo, useReducer } from "react";
import type { PracticeCategory, PracticeLevel, PracticeTempo } from "@/shared/types";

type PracticeSelection = { category: PracticeCategory; level: PracticeLevel; tempo: PracticeTempo; minutes: 5 | 10 | 15 };
type PracticeState = { selection: PracticeSelection; completedToday: number; currentStreak: number };
type Action =
  | { type: "set_selection"; selection: Partial<PracticeSelection> }
  | { type: "complete" };

const initialState: PracticeState = {
  selection: { category: "pitch", level: "beginner", tempo: "normal", minutes: 5 },
  completedToday: 0,
  currentStreak: 0,
};

export function practiceReducer(state: PracticeState, action: Action): PracticeState {
  if (action.type === "set_selection") return { ...state, selection: { ...state.selection, ...action.selection } };
  if (action.type === "complete") return { ...state, completedToday: state.completedToday + 1, currentStreak: Math.max(1, state.currentStreak + 1) };
  return state;
}

const PracticeContext = createContext<{ state: PracticeState; dispatch: React.Dispatch<Action> } | null>(null);

export function PracticeProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(practiceReducer, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <PracticeContext.Provider value={value}>{children}</PracticeContext.Provider>;
}

export function usePractice() {
  const value = useContext(PracticeContext);
  if (!value) throw new Error("usePractice must be used within PracticeProvider");
  return value;
}
