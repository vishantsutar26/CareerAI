import { NavLink, useNavigate } from 'react-router';
import { useAuth } from '../features/auth/hooks/useAuth';
import './navbar.scss';

const Navbar = () => {
  const { user, handleLogout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    try {
      await handleLogout();
    } finally {
      navigate('/login');
    }
  };

  return (
    <header className="navbar">
      <NavLink to="/" className="navbar__brand">
        Career<span>AI</span>
      </NavLink>
      <nav className="navbar__links">
        <NavLink to="/" end>Interview Plan</NavLink>
        <NavLink to="/resume">Resume Maker</NavLink>
        <NavLink to="/history">My History</NavLink>
      </nav>
      <div className="navbar__user">
        {user?.username && <span className="navbar__name">{user.username}</span>}
        <button type="button" onClick={onLogout}>Logout</button>
      </div>
    </header>
  );
};

export default Navbar;
