import { useAuth } from "../hooks/useAuth";
import EmptyState from "../components/EmptyState";

function RequireAccess({ permission, ownerOnly = false, children }) {
  const { isOwner, can } = useAuth();
  const allowed = ownerOnly ? isOwner : can(permission);

  if (!allowed) {
    return (
      <EmptyState
        title="Acesso restrito"
        message="Peça ao responsável pela conta para liberar esta funcionalidade."
      />
    );
  }

  return children;
}

export default RequireAccess;
