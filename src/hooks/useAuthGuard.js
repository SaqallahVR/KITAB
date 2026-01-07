import { useEffect, useMemo, useState } from "react";
import { kitabApi } from "@/api/kitabApiClient";

export default function useAuthGuard({ roles, redirectTo, requireAuth = true } = {}) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const rolesKey = useMemo(() => (roles ? roles.join(",") : ""), [roles]);
  const returnTo = redirectTo || (typeof window !== "undefined" ? window.location.href : "/");

  useEffect(() => {
    let isActive = true;
    kitabApi.auth
      .me()
      .then((userData) => {
        if (!isActive) return;
        if (!userData) {
          if (requireAuth) {
            kitabApi.auth.redirectToLogin(returnTo);
          }
          setUser(null);
          return;
        }
        if (roles && roles.length && !roles.includes(userData.role)) {
          window.location.href = "/";
          return;
        }
        setUser(userData);
      })
      .catch(() => {
        if (!isActive) return;
        if (requireAuth) {
          kitabApi.auth.redirectToLogin(returnTo);
        }
        setUser(null);
      })
      .finally(() => {
        if (isActive) setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [rolesKey, returnTo, requireAuth]);

  return { user, loading };
}
