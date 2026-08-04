import { createContext, useContext, useState, type PropsWithChildren } from 'react';

export type LocationSelection = {
  regionId: string | null;
  districtId: string | null;
  settlementId: string | null;
  label: string | null;
};

export type LocationSelectionTarget =
  | 'browse'
  | 'post'
  | 'business-profile'
  | 'seeker-profile'
  | 'vacancy-edit';

const EMPTY_SELECTION: LocationSelection = {
  regionId: null,
  districtId: null,
  settlementId: null,
  label: null,
};

type LocationSelectionContextValue = {
  getSelection: (target: LocationSelectionTarget) => LocationSelection;
  setSelection: (target: LocationSelectionTarget, selection: LocationSelection) => void;
};

const LocationSelectionContext = createContext<LocationSelectionContextValue | null>(null);

// location-filter.tsx экраны ?target=... параметріне қарай осында жазады,
// ал Вакансиялар/Жариялау/Бизнес профилі экрандары өз слотынан ғана оқиды.
export function LocationSelectionProvider({ children }: PropsWithChildren) {
  const [selections, setSelections] = useState<Record<string, LocationSelection>>({});

  const getSelection = (target: LocationSelectionTarget) => selections[target] ?? EMPTY_SELECTION;

  const setSelection = (target: LocationSelectionTarget, selection: LocationSelection) => {
    setSelections((current) => ({ ...current, [target]: selection }));
  };

  return (
    <LocationSelectionContext.Provider value={{ getSelection, setSelection }}>
      {children}
    </LocationSelectionContext.Provider>
  );
}

export function useLocationSelection() {
  const ctx = useContext(LocationSelectionContext);
  if (!ctx) throw new Error('useLocationSelection LocationSelectionProvider ішінде ғана қолданылады.');
  return ctx;
}
