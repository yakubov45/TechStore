import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { isAuthenticated, user } = useAuthStore();
    const location = useLocation();

    if (!isAuthenticated) {
        // Redirect them to the /signin page, but save the current location they were
        // trying to go to. This allows us to send them back to that page after they login.
        return <Navigate to="/signin" state={{ from: location }} replace />;
    }

    if (adminOnly && user?.role !== 'admin') {
        // If they are not an admin and the route is admin only, redirect to home
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
