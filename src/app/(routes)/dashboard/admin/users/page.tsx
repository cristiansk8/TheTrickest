'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardBody, CardHeader } from '@nextui-org/react';
import { Button } from '@nextui-org/react';
import { Select, SelectItem } from '@nextui-org/react';
import { Input } from '@nextui-org/react';
import { MdPeople, MdAdminPanelSettings, MdGavel, MdOutlineSkateboarding, MdSearch } from 'react-icons/md';
import Image from 'next/image';

interface User {
  id: number;
  email: string;
  name: string;
  photo: string;
  role: string;
  profileStatus: string;
  createdAt: string;
  totalSubmissions: number;
  totalScore: number;
}

interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [filters, setFilters] = useState({
    role: 'all',
    page: 1,
    limit: 20,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.role !== 'all') params.append('role', filters.role);
      params.append('page', filters.page.toString());
      params.append('limit', filters.limit.toString());

      const response = await fetch(`/api/admin/users?${params}`);
      if (response.ok) {
        const data: UsersResponse = await response.json();
        setUsers(data.users);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateUserRole = async (userId: number, newRole: string) => {
    setUpdating(userId);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'updateRole', newRole }),
      });

      if (response.ok) {
        // Refresh the users list
        fetchUsers();
      } else {
        console.error('Error updating user role');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
    setUpdating(null);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <MdAdminPanelSettings size={20} className="text-red-400" />;
      case 'judge': return <MdGavel size={20} className="text-accent-yellow-400" />;
      default: return <MdOutlineSkateboarding size={20} className="text-accent-cyan-400" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: 'from-red-500 to-accent-orange-500',
      judge: 'from-accent-yellow-500 to-accent-amber-500',
      skater: 'from-accent-cyan-500 to-accent-blue-500',
    };

    return (
      <span className={`text-xs bg-gradient-to-r ${colors[role as keyof typeof colors]} text-white px-3 py-1 rounded-full font-black uppercase tracking-wider shadow-lg`}>
        {role}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan-400 to-accent-purple-400 uppercase tracking-wider mb-2">
          👥 GESTIÓN DE USUARIOS
        </h1>
        <p className="text-neutral-600 text-lg">
          Administra roles y permisos de usuarios
        </p>
      </div>

      {/* Filters */}
      <Card className="bg-neutral-900 border-4 border-neutral-700">
        <CardHeader>
          <h3 className="text-xl font-black text-white uppercase tracking-wider">
            🔍 Filtros
          </h3>
        </CardHeader>
        <CardBody>
          <div className="flex gap-4 flex-wrap">
            <Select
              label="Rol"
              placeholder="Todos los roles"
              selectedKeys={[filters.role]}
              onSelectionChange={(keys) => setFilters(prev => ({
                ...prev,
                role: Array.from(keys)[0] as string,
                page: 1
              }))}
              className="w-48"
            >
              <SelectItem key="all" value="all">Todos</SelectItem>
              <SelectItem key="skater" value="skater">Skater</SelectItem>
              <SelectItem key="judge" value="judge">Juez</SelectItem>
              <SelectItem key="admin" value="admin">Admin</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Users List */}
      <Card className="bg-neutral-900 border-4 border-neutral-700">
        <CardHeader>
          <h3 className="text-xl font-black text-white uppercase tracking-wider">
            👤 Usuarios ({pagination.total})
          </h3>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-cyan-400"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="bg-gradient-to-r from-neutral-800 to-neutral-700 p-4 rounded-lg border border-neutral-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-accent-cyan-500 to-accent-purple-600 rounded-full blur-sm"></div>
                        <Image
                          className="relative rounded-full w-12 h-12 border-2 border-white"
                          src={user.photo || "/logo.png"}
                          alt={user.name || 'User'}
                          width={48}
                          height={48}
                        />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-lg">{user.name || 'Sin nombre'}</h4>
                        <p className="text-neutral-400 text-sm">{user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {getRoleIcon(user.role)}
                          {getRoleBadge(user.role)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-neutral-400 text-xs uppercase tracking-wider">Submissions</p>
                        <p className="text-2xl font-black text-accent-cyan-400">{user.totalSubmissions}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-neutral-400 text-xs uppercase tracking-wider">Score Total</p>
                        <p className="text-2xl font-black text-accent-yellow-400">{user.totalScore}</p>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Select
                          size="sm"
                          placeholder="Cambiar rol"
                          selectedKeys={[user.role]}
                          onSelectionChange={(keys) => {
                            const newRole = Array.from(keys)[0] as string;
                            if (newRole !== user.role) {
                              updateUserRole(user.id, newRole);
                            }
                          }}
                          disabled={updating === user.id}
                          className="w-40"
                        >
                          <SelectItem key="skater" value="skater">Skater</SelectItem>
                          <SelectItem key="judge" value="judge">Juez</SelectItem>
                          <SelectItem key="admin" value="admin">Admin</SelectItem>
                        </Select>
                        {updating === user.id && (
                          <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-accent-cyan-400"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {users.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-neutral-400 text-lg">No se encontraron usuarios</p>
                </div>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            disabled={pagination.page <= 1}
            onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
            className="bg-gradient-to-r from-accent-cyan-500 to-accent-blue-600 text-white font-bold"
          >
            Anterior
          </Button>

          <span className="flex items-center px-4 py-2 bg-neutral-800 text-white rounded-lg">
            Página {pagination.page} de {pagination.pages}
          </span>

          <Button
            disabled={pagination.page >= pagination.pages}
            onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
            className="bg-gradient-to-r from-accent-cyan-500 to-accent-blue-600 text-white font-bold"
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
}