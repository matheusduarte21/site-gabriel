import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { signOut } from '../../lib/auth';

const StaffHeader = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/staff/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <div className="">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Sair
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffHeader;