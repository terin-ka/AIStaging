import { createContext, useContext, useState, useEffect } from 'react';
import { useApi } from './ApiProvider';

const UserContext = createContext();

export default function UserProvider({ children }) {
  const [user, setUser] = useState();
  const api = useApi();

  useEffect(() => {
    (async () => {
     const user = await api.userAuthenticated();
     setUser(user);
    })();
  }, [api]);

  const login = async (username, password) => {
    const logged = await api.login(username, password);
    if (logged) {
      const user = await api.userAuthenticated();
      setUser(user);
    }
    return logged;
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  const refreshUser = async() => {
    const user = await api.userAuthenticated();
    setUser(user);
  }

  return (
    <UserContext.Provider value={{ user, setUser, login, logout, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}

