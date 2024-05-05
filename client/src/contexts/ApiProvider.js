import { createContext, useContext } from 'react';
import StagingApiClient from '../StagingApiClient';

const ApiContext = createContext();

export default function ApiProvider({ children }) {
  const api = new StagingApiClient();

  return (
    <ApiContext.Provider value={api}>
      {children}
    </ApiContext.Provider>
  );
}

export function useApi() {
  return useContext(ApiContext);
}