import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { parse, stringify } from "picoquery";
import { VideoQueryContainer, SORT_OPTIONS } from "../types";

/**
 * Interface for the search parameter context.
 * This abstraction allows the search component to either persist
 * search state via URL parameters or via React state.
 */
export interface SearchParameterContextValue {
  /** Current video query container */
  queryContainer: VideoQueryContainer | undefined;
  /** Current sort option */
  sortOption: (typeof SORT_OPTIONS)[number];
  /** Set the sort option */
  setSortOption: (sort: (typeof SORT_OPTIONS)[number]) => void;
  /** Execute a search with the given query container. This may navigate (URL mode) or just update state. */
  doSearch: (queryContainer: VideoQueryContainer) => void;
  /** Whether this provider uses URL-based persistence */
  isUrlBased: boolean;
  /** Current page (1-indexed) */
  currentPage: number;
  /** Set the current page */
  setCurrentPage: (page: number) => void;
}

const SearchParameterContext = createContext<
  SearchParameterContextValue | undefined
>(undefined);

/**
 * Hook to access the search parameter context.
 * Throws if used outside of a SearchParameterProvider.
 */
export function useSearchParameters(): SearchParameterContextValue {
  const context = useContext(SearchParameterContext);
  if (!context) {
    throw new Error(
      "useSearchParameters must be used within a SearchParameterProvider",
    );
  }
  return context;
}

/**
 * Optional hook that returns undefined if outside a provider.
 * Useful for components that may work both inside and outside search contexts.
 */
export function useSearchParametersOptional():
  | SearchParameterContextValue
  | undefined {
  return useContext(SearchParameterContext);
}

interface UrlSearchParameterProviderProps {
  children: ReactNode;
}

/**
 * URL-based search parameter provider.
 * Persists search state in URL query parameters and navigates to /search.
 * This is the default behavior for the main search page.
 */
export function UrlSearchParameterProvider({
  children,
}: UrlSearchParameterProviderProps) {
  const navigate = useNavigate();
  const { search: urlSearchString } = useLocation();

  // Parse query container from URL
  const queryContainer = useMemo<VideoQueryContainer | undefined>(() => {
    if (urlSearchString) {
      return parse(urlSearchString.slice(1)) as unknown as VideoQueryContainer;
    }
    return undefined;
  }, [urlSearchString]);

  // Internal state for sort and page (derived from URL but can be locally overridden)
  const [sortOption, setSortOptionState] = useState<
    (typeof SORT_OPTIONS)[number]
  >(queryContainer?.sort || "score");
  const [currentPage, setCurrentPage] = useState(1);

  // Sync sort option when URL changes
  useMemo(() => {
    if (queryContainer?.sort) {
      setSortOptionState(queryContainer.sort);
    }
    setCurrentPage(1); // Reset page on new search
  }, [queryContainer]);

  const setSortOption = useCallback((sort: (typeof SORT_OPTIONS)[number]) => {
    setSortOptionState(sort);
    setCurrentPage(1);
  }, []);

  const doSearch = useCallback(
    (qc: VideoQueryContainer) => {
      navigate({
        pathname: "/search",
        search: "?" + stringify(qc as unknown as Record<string, unknown>),
      });
    },
    [navigate],
  );

  const value: SearchParameterContextValue = useMemo(
    () => ({
      queryContainer,
      sortOption,
      setSortOption,
      doSearch,
      isUrlBased: true,
      currentPage,
      setCurrentPage,
    }),
    [queryContainer, sortOption, setSortOption, doSearch, currentPage],
  );

  return (
    <SearchParameterContext.Provider value={value}>
      {children}
    </SearchParameterContext.Provider>
  );
}

interface StateSearchParameterProviderProps {
  children: ReactNode;
  /** Initial query container, if any */
  initialQueryContainer?: VideoQueryContainer;
  /** Callback when a search is performed */
  onSearch?: (queryContainer: VideoQueryContainer) => void;
}

/**
 * State-based search parameter provider.
 * Persists search state in React state instead of URL parameters.
 * Useful for embedded search components (e.g., in sheets/dialogs/multiview).
 */
export function StateSearchParameterProvider({
  children,
  initialQueryContainer,
  onSearch,
}: StateSearchParameterProviderProps) {
  const [queryContainer, setQueryContainer] = useState<
    VideoQueryContainer | undefined
  >(initialQueryContainer);
  const [sortOption, setSortOptionState] = useState<
    (typeof SORT_OPTIONS)[number]
  >(initialQueryContainer?.sort || "score");
  const [currentPage, setCurrentPage] = useState(1);

  const setSortOption = useCallback((sort: (typeof SORT_OPTIONS)[number]) => {
    setSortOptionState(sort);
    setCurrentPage(1);
  }, []);

  const doSearch = useCallback(
    (qc: VideoQueryContainer) => {
      setQueryContainer(qc);
      setCurrentPage(1);
      onSearch?.(qc);
    },
    [onSearch],
  );

  const value: SearchParameterContextValue = useMemo(
    () => ({
      queryContainer,
      sortOption,
      setSortOption,
      doSearch,
      isUrlBased: false,
      currentPage,
      setCurrentPage,
    }),
    [queryContainer, sortOption, setSortOption, doSearch, currentPage],
  );

  return (
    <SearchParameterContext.Provider value={value}>
      {children}
    </SearchParameterContext.Provider>
  );
}

export { SearchParameterContext };
