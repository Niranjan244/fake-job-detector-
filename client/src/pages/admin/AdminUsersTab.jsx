import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  Shield,
  UserCheck,
  Trash2,
  Calendar,
  Mail,
  UserCog,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Card,
  Button,
  Input,
  Badge,
  Alert,
  EmptyState,
  Pagination,
  Skeleton,
} from '../../components/ui';

export default function AdminUsersTab() {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 15);
      if (search.trim()) params.append('search', search.trim());

      const response = await api.get(`/admin/users?${params.toString()}`);
      setUsers(response.data.data || []);
      setTotalPages(response.data.totalPages || 1);
      setTotal(response.data.total || 0);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Failed to fetch user list.'
      );
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'jobseeker' : 'admin';
    if (
      userId === currentAdmin?.id ||
      userId === currentAdmin?._id
    ) {
      alert('Administrators cannot alter their own permission role.');
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to change this user's role to ${newRole}?`
      )
    ) {
      return;
    }

    setActionLoadingId(userId);
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user role.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (
      userId === currentAdmin?.id ||
      userId === currentAdmin?._id
    ) {
      alert('You cannot delete your own active administrator account.');
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to permanently delete user "${userEmail}"?`
      )
    ) {
      return;
    }

    setActionLoadingId(userId);
    try {
      await api.delete(`/admin/users/${userId}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search Header */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-80">
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name or email..."
              icon={Search}
            />
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg whitespace-nowrap">
            {total} registered accounts
          </span>
        </div>
      </Card>

      {errorMessage && (
        <Alert variant="error" title="User Directory Error">
          {errorMessage}
        </Alert>
      )}

      {/* Users Table Card */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        ) : users.length === 0 ? (
          <div className="p-10 text-center">
            <EmptyState
              icon={Users}
              title="No users found"
              description="No user accounts match your search query."
            />
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">User Name</th>
                    <th className="px-4 py-3.5">Email Address</th>
                    <th className="px-4 py-3.5">Role</th>
                    <th className="px-4 py-3.5">Registered</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => {
                    const isSelf =
                      u._id === currentAdmin?.id || u._id === currentAdmin?._id;
                    const isAdmin = u.role === 'admin';

                    return (
                      <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-4 font-semibold text-slate-900">
                          <div className="flex items-center gap-2">
                            <span>{u.name}</span>
                            {isSelf && (
                              <Badge variant="brand" size="sm">
                                You
                              </Badge>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-4 text-xs text-slate-600">
                          {u.email}
                        </td>

                        <td className="px-4 py-4">
                          <Badge
                            variant={isAdmin ? 'warning' : 'neutral'}
                            size="sm"
                          >
                            {u.role}
                          </Badge>
                        </td>

                        <td className="px-4 py-4 text-xs text-slate-500">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>

                        <td className="px-5 py-4 text-right">
                          {!isSelf && (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleRoleToggle(u._id, u.role)}
                                disabled={actionLoadingId === u._id}
                                icon={UserCog}
                              >
                                {isAdmin ? 'Make Seeker' : 'Make Admin'}
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDeleteUser(u._id, u.email)}
                                disabled={actionLoadingId === u._id}
                                icon={Trash2}
                              >
                                Delete
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked View */}
            <div className="md:hidden divide-y divide-slate-100">
              {users.map((u) => {
                const isSelf =
                  u._id === currentAdmin?.id || u._id === currentAdmin?._id;
                const isAdmin = u.role === 'admin';

                return (
                  <div key={u._id} className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-sm">{u.name}</span>
                        {isSelf && (
                          <Badge variant="brand" size="sm">
                            You
                          </Badge>
                        )}
                      </div>
                      <Badge
                        variant={isAdmin ? 'warning' : 'neutral'}
                        size="sm"
                      >
                        {u.role}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-500">{u.email}</p>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </span>
                      {!isSelf && (
                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleRoleToggle(u._id, u.role)}
                            disabled={actionLoadingId === u._id}
                          >
                            {isAdmin ? 'Make Seeker' : 'Make Admin'}
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteUser(u._id, u.email)}
                            disabled={actionLoadingId === u._id}
                            icon={Trash2}
                          >
                            Delete
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-slate-100">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                totalItems={total}
              />
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
