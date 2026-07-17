import { create } from 'zustand';

export interface FilterState {
  priority: string;
  epic: string;
  type: string;
  status: string;
  assigneeId: string;
  search: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

interface AppState {
  activeSprintId: number;
  filters: FilterState;
  isCopilotOpen: boolean;
  copilotMessages: Message[];
  theme: 'dark' | 'light';
  setActiveSprintId: (id: number) => void;
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;
  toggleCopilot: (isOpen?: boolean) => void;
  addCopilotMessage: (sender: 'user' | 'bot', text: string) => void;
  clearCopilotHistory: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

const initialFilters: FilterState = {
  priority: '',
  epic: '',
  type: '',
  status: '',
  assigneeId: '',
  search: '',
};

const initialWelcomeMessage: Message = {
  id: 'welcome',
  sender: 'bot',
  text: `### 👋 Welcome to Sprint Intelligence Copilot!
I am analyzing **250 issues** across **10 sprints** in real time. 

Here is the current state of **Sprint 10**:
- **Sprint Health Score**: 🛡️ **84/100**
- **Target Commitment**: **132 Story Points**
- **Current Completion**: **22 Story Points**
- **Completion Probability**: 🔴 **34%**
- **Critical Blockers**: 🛑 **3 active**

*Ask me questions like:*
- *What is blocking our sprint?*
- *Who on the team is overloaded?*
- *Can you generate an executive summary?*
- *What are the biggest risks?*`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

export const useAppStore = create<AppState>((set) => ({
  activeSprintId: 10,
  filters: initialFilters,
  isCopilotOpen: false,
  copilotMessages: [initialWelcomeMessage],
  theme: 'dark',

  setActiveSprintId: (id) => set({ activeSprintId: id }),
  
  setFilter: (key, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
      },
    })),

  resetFilters: () => set({ filters: initialFilters }),

  toggleCopilot: (isOpen) =>
    set((state) => ({
      isCopilotOpen: isOpen !== undefined ? isOpen : !state.isCopilotOpen,
    })),

  addCopilotMessage: (sender, text) =>
    set((state) => {
      const newMessage: Message = {
        id: Math.random().toString(36).substring(7),
        sender,
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      return {
        copilotMessages: [...state.copilotMessages, newMessage],
      };
    }),

  clearCopilotHistory: () => set({ copilotMessages: [initialWelcomeMessage] }),

  setTheme: (theme) => set({ theme }),
}));
