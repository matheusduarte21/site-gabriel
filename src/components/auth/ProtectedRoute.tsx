import { useEffect, useState } from "react";
import { getCurrentUser } from "../../lib/auth";
import { Navigate, useNavigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireStaff?: boolean; 
}

const ProtectedRoute = ({ children, requireAdmin = false, requireStaff = false }: ProtectedRouteProps) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const currentUser = await getCurrentUser();
      console.log(currentUser);
      
      if (!currentUser) {
        navigate('/admin/login');
        return;
      }

      if (requireAdmin && currentUser.email !== 'admin@techservice.com.br') {
        navigate('/');
        return;
      }

      if (requireStaff && currentUser.email !== 'tecnicos@teccorp.com.br') {
        navigate('/');
        return;
      }

      setUser(currentUser);
    } catch (error) {
      navigate('/');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800"></div>
    </div>;
  }

  if (!user) {
    return <Navigate to="/admin/login" />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;