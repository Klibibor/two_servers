import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

/**
 * ProtectedRoute
 * - redirects anonymous users to '/'
 * - redirects authenticated users who are neither superuser nor member of allowed groups to '/'
 *
 * Props:
 * - children: react node
 * - allowedGroups: array of group names to allow (default ['JWT'])
 * - requireSuperuser: if true, superusers bypass group checks (default true)
 */
export default function ProtectedRoute({ children, allowedGroups = ['JWT'], requireSuperuser = true }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  // While auth state is resolving, render nothing
  if (loading) return null

  // Not logged in -> go home --> "/"
  if (!user) return <Navigate to='/' replace state={{ from: location }} />

  // If superuser and we allow permit to children (allowedGroups and requireSuperuser)
  if (requireSuperuser && user?.is_superuser) return children

  // user.groups could be array of objects or strings; normalize to names
  const groups = Array.isArray(user?.groups)
    ? user.groups.map(g => (typeof g === 'string' ? g : g?.name)).filter(Boolean)
    : []

  const inAllowedGroup = allowedGroups.some(g => groups.includes(g))
  if (!inAllowedGroup) {
    return <Navigate to='/' replace />
  }

  return children
}

/*
Example usage (React Router v6):

<Route
  path="/admin"
  element={
    <ProtectedRoute allowedGroups={["JWT"]}>
      <AdminCrudPage />
    </ProtectedRoute>
  }
/>

*/
