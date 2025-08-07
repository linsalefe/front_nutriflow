import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const token = localStorage.getItem('token');

  useEffect(() => {
    const checkAccess = async () => {
      if (!token) {
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }

      try {
        // Busca dados do usuário atual
        const response = await api.get('/user/me');
        const user = response.data;
        
        setIsLoggedIn(true);
        
        // Verifica se é admin OU tem acesso pago
        const userHasAccess = user.is_admin || user.has_access;
        setHasAccess(userHasAccess);
        
      } catch (error) {
        console.error('Erro ao verificar acesso:', error);
        setIsLoggedIn(false);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [token]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Carregando...
      </div>
    );
  }

  // Se não está logado, vai para login
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Se está logado mas não tem acesso, vai para página de pagamento
  if (!hasAccess) {
    return <Navigate to="/pagamento" replace />;
  }

  // Se tem acesso, mostra o conteúdo
  return <>{children}</>;
}