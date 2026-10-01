'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import { getAllowedEnvironments, resolveEnvironment } from './config';

type Environment = 'development' | 'staging' | 'production';

interface EnvironmentContextType {
  environment: Environment;
  setEnvironment: (env: Environment) => void;
}

const EnvironmentContext = createContext<EnvironmentContextType | undefined>(
  undefined
);

export function EnvironmentProvider({ children }: { children: ReactNode }) {
  const [environment, setEnvironmentState] = useState<Environment>(
    resolveEnvironment(null)
  );
  const hydrationDone = useRef(false);

  useEffect(() => {
    if (!hydrationDone.current) {
      hydrationDone.current = true;
      const saved = localStorage.getItem(
        'db-environment'
      ) as Environment | null;
      const allowed = getAllowedEnvironments();
      const selected = resolveEnvironment(saved);

      if (selected !== resolveEnvironment(null)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setEnvironmentState(selected);
      }

      if (!saved || !allowed.includes(saved)) {
        localStorage.setItem('db-environment', selected);
      }
    }
  }, []);

  const setEnvironment = (env: Environment) => {
    const selected = resolveEnvironment(env);
    setEnvironmentState(selected);
    localStorage.setItem('db-environment', selected);
  };

  return (
    <EnvironmentContext.Provider value={{ environment, setEnvironment }}>
      {children}
    </EnvironmentContext.Provider>
  );
}

export function useEnvironment() {
  const context = useContext(EnvironmentContext);
  if (!context) {
    throw new Error('useEnvironment must be used within EnvironmentProvider');
  }
  return context;
}
