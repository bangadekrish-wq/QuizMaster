import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import { useToast } from '../../context/ToastContext';
import { Header } from '../../components/layout/Header';
import { SearchBar } from '../../components/common/SearchBar';
import { FilterBar } from '../../components/common/FilterBar';
import { Table } from '../../components/common/Table';
import { Pagination } from '../../components/common/Pagination';
import { Avatar } from '../../components/common/Avatar';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { Eye, UserCheck, UserX, Trash2 } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const UsersPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [users, setUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);

  // Dialog State
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionType, setActionType] = useState(null); // 'status' | 'delete'

  const fetchUsers = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await userService.getUsers({ search, status: statusFilter, page });
      setUsers(res.users || []);
      setTotalPages(res.totalPages || 1);
      setTotalRecords(res.total || (res.users || []).length);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, statusFilter, page]);

  const handleConfirmAction = async () => {
    if (!selectedUser || !actionType) return;
    try {
      if (actionType === 'status') {
        const nextStatus = selectedUser.status === 'Active' ? 'Inactive' : 'Active';
        await userService.updateStatus(selectedUser.id, nextStatus);
        addToast(`User ${selectedUser.name} set to ${nextStatus}`, 'success');
      } else if (actionType === 'delete') {
        await userService.deleteUser(selectedUser.id);
        addToast(`User ${selectedUser.name} deleted`, 'info');
      }
      fetchUsers();
    } catch (err) {
      addToast('Action failed', 'error');
    } finally {
      setSelectedUser(null);
      setActionType(null);
    }
  };

  const columns = [
    {
      header: 'User',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar src={row.avatar} name={row.name} size="sm" />
          <div className="flex flex-col">
            <span className="font-bold text-slate-100">{row.name}</span>
            <span className="text-[11px] text-slate-400">{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Role',
      accessor: 'role',
      render: (row) => (
        <Badge variant={row.role === 'ADMIN' ? 'purple' : 'cyan'}>
          {row.role || 'STUDENT'}
        </Badge>
      ),
    },
    {
      header: 'Registration Date',
      accessor: 'registrationDate',
      render: (row) => formatDate(row.registrationDate),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <Badge variant={row.status === 'Active' ? 'green' : 'red'}>
          {row.status}
        </Badge>
      ),
    },
    { header: 'Quizzes Attempted', accessor: 'quizzesAttempted' },
    {
      header: 'Average Score',
      accessor: 'averageScore',
      render: (row) => (
        <span className="font-bold text-brand-cyanLight">{row.averageScore}%</span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={Eye}
            onClick={() => navigate(`/admin/users/${row.id}`)}
            title="View Details"
          />
          <Button
            variant="ghost"
            size="sm"
            icon={row.status === 'Active' ? UserX : UserCheck}
            onClick={() => {
              setSelectedUser(row);
              setActionType('status');
            }}
            title={row.status === 'Active' ? 'Deactivate User' : 'Activate User'}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            className="hover:text-brand-red"
            onClick={() => {
              setSelectedUser(row);
              setActionType('delete');
            }}
            title="Delete User"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Header
        title="User Management"
        subtitle="View, filter, and manage all registered user accounts and performance metrics."
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-dark-card border border-dark-border p-4 rounded-ms-lg">
        <div className="w-full sm:w-72">
          <SearchBar value={search} onChange={setSearch} placeholder="Search user by name or email..." />
        </div>
        <FilterBar
          filters={['All', 'Active', 'Inactive']}
          activeFilter={statusFilter}
          onSelectFilter={setStatusFilter}
        />
      </div>

      {/* Content Table */}
      {loading ? (
        <LoadingSpinner label="Fetching user list..." />
      ) : error ? (
        <ErrorState onRetry={fetchUsers} />
      ) : (
        <>
          <Table columns={columns} data={users} emptyText="No user accounts found." />
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} totalRecords={totalRecords} />
        </>
      )}

      {/* Action Confirmation */}
      <ConfirmDialog
        isOpen={!!selectedUser}
        onClose={() => {
          setSelectedUser(null);
          setActionType(null);
        }}
        onConfirm={handleConfirmAction}
        title={actionType === 'delete' ? 'Delete User' : 'Update User Status'}
        message={
          actionType === 'delete'
            ? `Are you sure you want to permanently delete user "${selectedUser?.name}"?`
            : `Are you sure you want to change status of "${selectedUser?.name}" to ${selectedUser?.status === 'Active' ? 'Inactive' : 'Active'}?`
        }
        variant={actionType === 'delete' ? 'danger' : 'primary'}
      />
    </div>
  );
};
