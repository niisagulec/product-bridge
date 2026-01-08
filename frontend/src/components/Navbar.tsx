import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/auth';

interface Props {
  role: 'user' | 'admin';
  userName: string;
}

const Navbar = ({ role, userName }: Props) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const roleLabel = role === 'admin' ? 'yönetici' : 'kullanıcı';

  return (
    <header className="topbar">
      <div className="topbarInner container">
        <div className="brand" role="banner">
          <div className="brandMark" aria-hidden="true" />
          <div>
            <div className="brandTitle">FiyatRadar</div>
            <div className="brandSubtitle muted">Ara · Karşılaştır · Kaydet</div>
          </div>
        </div>

        <nav className="nav" aria-label="Ana Menü">
          <NavLink
            className={({ isActive }) => (isActive ? 'navItem active' : 'navItem')}
            to="/"
            end
          >
            Ana Sayfa
          </NavLink>

          {role === 'user' && (
            <NavLink className={({ isActive }) => (isActive ? 'navItem active' : 'navItem')} to="/favorites">
              Favoriler
            </NavLink>
          )}

          {role === 'admin' && (
            <NavLink className={({ isActive }) => (isActive ? 'navItem active' : 'navItem')} to="/admin">
              Yönetim
            </NavLink>
          )}
        </nav>

        <div className="topbarRight">
          <div className="userBadge">
            <div className="userName">{userName}</div>
            <div className="muted" style={{ fontSize: 12 }}>
              {roleLabel}
            </div>
          </div>
          <button
            className="button buttonSecondary"
            onClick={() => {
              logout();
              navigate('/login', { replace: true });
            }}
          >
            Çıkış
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
