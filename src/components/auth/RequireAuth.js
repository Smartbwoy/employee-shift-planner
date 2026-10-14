import { Navigate, useLocation } from "react-router-dom";
import { currentUser, currentRole, homeForCurrentRole, useSession } from "../../api/auth";

/**
 * Authentication and role-aware UX gate for planner screens. The API mirrors
 * these rules as the actual security boundary.
 */
export default function RequireAuth({ children, roles }) {
  const location = useLocation();
  const signedIn = useSession();

  if (!signedIn) {
    return <Navigate replace to="/" state={location.pathname === "/change-password" ? undefined : { from: `${location.pathname}${location.search}` }} />;
  }

  if (currentUser()?.mustChangePassword && location.pathname !== "/change-password") {
    return <Navigate replace to="/change-password" />;
  }

  if (roles && !roles.includes(currentRole())) {
    return <Navigate replace to={homeForCurrentRole()} />;
  }

  return children;
}
