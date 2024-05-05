import { Navigate } from 'react-router-dom';
import { useUser } from '../contexts/UserProvider';

//pokud je user přihlášen tak nemá smysl zobrazovat page login nebo register
// v tomto případě dojde tedy k přesměrování na home page
export default function PublicRoute({ children }) {
  const { user } = useUser();

  if (user === undefined) {
    return null;
  }
  else if (user) {
    return <Navigate to="/" />
  }
  else {
    return children;
  }
}