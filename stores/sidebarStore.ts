import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarStore {
  isCollapsed: boolean;
  activeModule: string;
  toggleCollapse: () => void;
  setActiveModule: (module: string) => void;
}

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set) => ({
      isCollapsed: false,
      activeModule: 'dashboard',
      toggleCollapse: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
      setActiveModule: (module) => set({ activeModule: module }),
    }),
    { name: 'surya-erp-sidebar' },
  ),
);
