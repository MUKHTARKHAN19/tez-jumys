import { createContext, useContext, useState, type PropsWithChildren } from 'react';

export type SalaryFilter = {
  salaryFrom: number | null;
  salaryTo: number | null;
};

const EMPTY_SALARY_FILTER: SalaryFilter = { salaryFrom: null, salaryTo: null };

type BrowseFiltersContextValue = {
  salaryFilter: SalaryFilter;
  setSalaryFilter: (filter: SalaryFilter) => void;
};

const BrowseFiltersContext = createContext<BrowseFiltersContextValue | null>(null);

// filter.tsx (жалақы слайдері) осында жазады, ал (tabs)/index.tsx осыдан оқып,
// вакансия тізімін сүзеді.
export function BrowseFiltersProvider({ children }: PropsWithChildren) {
  const [salaryFilter, setSalaryFilter] = useState<SalaryFilter>(EMPTY_SALARY_FILTER);

  return (
    <BrowseFiltersContext.Provider value={{ salaryFilter, setSalaryFilter }}>
      {children}
    </BrowseFiltersContext.Provider>
  );
}

export function useBrowseFilters() {
  const ctx = useContext(BrowseFiltersContext);
  if (!ctx) throw new Error('useBrowseFilters BrowseFiltersProvider ішінде ғана қолданылады.');
  return ctx;
}
