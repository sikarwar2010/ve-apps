import { create } from 'zustand';

interface TableStore {
  pageSize: number;
  setPageSize: (size: number) => void;
}

export const useTableStore = create<TableStore>((set) => ({
  pageSize: 25,
  setPageSize: (size) => set({ pageSize: size }),
}));
