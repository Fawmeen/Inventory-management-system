import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();

  const links = [{ to: '/products', label: 'Products', roles: ['MANAGER', 'STAFF', 'USER'] }];

  if (user.role === 'MANAGER') {
    links.push(
      { to: '/manage', label: 'Manage', roles: ['MANAGER'] },
      { to: '/logs', label: 'Logs', roles: ['MANAGER'] }
    );
  }

  if (user.role === 'STAFF') {
    links.push({ to: '/inventory', label: 'Stock', roles: ['STAFF'] });
  }

  if (user.role === 'USER') {
    links.push({ to: '/orders', label: 'Orders', roles: ['USER'] });
  }

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Inventory</h1>
          <p className="muted">
            {user.name} · {user.role}
          </p>
        </div>
        <nav className="nav">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => (isActive ? 'active' : '')}>
              {link.label}
            </NavLink>
          ))}
          <button type="button" className="btn-secondary" onClick={logout}>
            Logout
          </button>
        </nav>
      </header>
      <main className="main">
        <Outlet />
      </main>
      <footer className="footer">
        <Link to="/products">Home</Link>
      </footer>
    </div>
  );
}
