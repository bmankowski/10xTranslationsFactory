// Compatibility layer for React 19 in Astro
import * as ReactAll from 'react';

// Default export for React
const React = {
  ...ReactAll,
  jsx: ReactAll.jsx || ReactAll.createElement,
  jsxs: ReactAll.jsxs || ReactAll.createElement,
  jsxDEV: ReactAll.jsxDEV || ReactAll.createElement,
  Fragment: ReactAll.Fragment,
};

// Re-export everything from React
export * from 'react';
export default React;

// Add compatibility for functions
export const createElement = ReactAll.jsx || ReactAll.createElement;
export const startTransition = ReactAll.startTransition || function(callback) { callback(); };

// Export core React functions
export const forwardRef = ReactAll.forwardRef;
export const createContext = ReactAll.createContext;
export const useCallback = ReactAll.useCallback;
export const useContext = ReactAll.useContext;
export const useEffect = ReactAll.useEffect;
export const useId = ReactAll.useId;
export const useLayoutEffect = ReactAll.useLayoutEffect;
export const useMemo = ReactAll.useMemo;
export const useReducer = ReactAll.useReducer;
export const useRef = ReactAll.useRef;
export const useState = ReactAll.useState; 