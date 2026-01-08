import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

const MainLayout = ({ role, userName }: { role: 'user' | 'admin'; userName: string }) => {
  return (
    <div className="appShell">
      <Navbar role={role} userName={userName} />
      <main className="container">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
