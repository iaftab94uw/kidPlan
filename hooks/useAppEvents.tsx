import { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';

interface AppEventsContextType {
  triggerRefresh: (type: 'events' | 'schedules' | 'family' | 'all') => void;
  subscribeToRefresh: (callback: (type: 'events' | 'schedules' | 'family' | 'all') => void) => () => void;
}

const AppEventsContext = createContext<AppEventsContextType | undefined>(undefined);

export const AppEventsProvider = ({ children }: { children: ReactNode }) => {
  const refreshCallbacksRef = useRef<Array<(type: 'events' | 'schedules' | 'family' | 'all') => void>>([]);

  const triggerRefresh = useCallback((type: 'events' | 'schedules' | 'family' | 'all') => {
    console.log(`Triggering refresh for: ${type}`);
    refreshCallbacksRef.current.forEach(callback => callback(type));
  }, []);

  const subscribeToRefresh = useCallback((callback: (type: 'events' | 'schedules' | 'family' | 'all') => void) => {
    refreshCallbacksRef.current.push(callback);
    
    // Return unsubscribe function
    return () => {
      refreshCallbacksRef.current = refreshCallbacksRef.current.filter(cb => cb !== callback);
    };
  }, []);

  return (
    <AppEventsContext.Provider value={{ triggerRefresh, subscribeToRefresh }}>
      {children}
    </AppEventsContext.Provider>
  );
};

export const useAppEvents = () => {
  const context = useContext(AppEventsContext);
  if (!context) {
    throw new Error('useAppEvents must be used within an AppEventsProvider');
  }
  return context;
};
