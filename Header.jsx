import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const { role, logout } = useAuth();
  const navigate = useNavigate();

  if (!role) return null;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const goToAccount = () => {
    navigate("/mon-compte");
  };

  const goToHome = () => {
    navigate("/accueil");
  };

  const goToRolePage = () => {
    navigate(`/${role}`);
  };

  return (
    <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-xl border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo/Rôle Section */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">
                {role?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <span
                onClick={goToRolePage}
                className="text-white font-bold text-xl capitalize cursor-pointer hover:text-blue-400 transition-colors duration-200 flex items-center group"
                title="Aller à votre tableau de bord"
              >
                {role}
                <svg 
                  className="w-4 h-4 ml-2 text-gray-400 group-hover:text-blue-400 transition-colors duration-200" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
              <p className="text-gray-400 text-sm">Tableau de bord</p>
            </div>
          </div>

          {/* Navigation Buttons */}
          <nav className="flex items-center space-x-3">
            <button
              onClick={goToHome}
              className="group relative px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium rounded-xl shadow-lg hover:shadow-emerald-500/25 hover:scale-105 transition-all duration-200 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Accueil</span>
            </button>

            <button
              onClick={goToAccount}
              className="group relative px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl shadow-lg hover:shadow-blue-500/25 hover:scale-105 transition-all duration-200 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Mon compte</span>
            </button>

            <button
              onClick={handleLogout}
              className="group relative px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-xl shadow-lg hover:shadow-red-500/25 hover:scale-105 transition-all duration-200 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Déconnexion</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
} 