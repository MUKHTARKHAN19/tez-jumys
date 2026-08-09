import { createContext, useContext, useState, type PropsWithChildren } from 'react';

export type SalaryFilter = {
  salaryFrom: number | null;
  salaryTo: number | null;
};

const EMPTY_SALARY_FILTER: SalaryFilter = { salaryFrom: null, salaryTo: null };

type BrowseFiltersContextValue = {
  salaryFilter: SalaryFilter;
  setSalaryFilter: (filter: SalaryFilter) => void;
  selectedPositionIds: string[];
  setSelectedPositionIds: (ids: string[]) => void;
  togglePositionId: (id: string) => void;
};

const BrowseFiltersContext = createContext<BrowseFiltersContextValue | null>(null);

// filter.tsx (жалақы слайдері + лауазым сүзгісі) осында жазады, ал (tabs)/index.tsx
// осыдан оқып, вакансия тізімін сүзеді әрі жоғарғы chip қатарымен синхрондайды.
export function BrowseFiltersProvider({ children }: PropsWithChildren) {
  const [salaryFilter, setSalaryFilter] = useState<SalaryFilter>(EMPTY_SALARY_FILTER);
  const [selectedPositionIds, setSelectedPositionIds] = useState<string[]>([]);

  const togglePositionId = (id: string) => {
    setSelectedPositionIds((current) =>
      current.includes(id) ? current.filter((existing) => existing !== id) : [...current, id]
    );
  };

  return (
    <BrowseFiltersContext.Provider
      value={{
        salaryFilter,
        setSalaryFilter,
        selectedPositionIds,
        setSelectedPositionIds,
        togglePositionId,
      }}>
      {children}
    </BrowseFiltersContext.Provider>
  );
}

export function useBrowseFilters() {
  const ctx = useContext(BrowseFiltersContext);
  if (!ctx) throw new Error('useBrowseFilters BrowseFiltersProvider ішінде ғана қолданылады.');
  return ctx;
}
