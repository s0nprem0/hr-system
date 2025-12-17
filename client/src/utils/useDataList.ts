import { useCallback, useEffect, useState } from 'react';
import api from '../utils/api';
import type { ApiResponse } from '@hr/shared';
import handleApiError from '../utils/handleApiError';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';

export interface UseDataListOptions {
  endpoint: string;
  pageSize?: number;
  searchPlaceholder?: string;
  deleteConfirmMessage?: string;
  deleteSuccessMessage?: string;
}

export interface UseDataListReturn<T> {
  items: T[];
  loading: boolean;
  error: string | null;
  page: number;
  pageSize: number;
  total: number;
  search: string;
  setPage: (page: number) => void;
  setSearch: (search: string) => void;
  refetch: () => void;
  handleDelete: (id: string) => Promise<void>;
}

export function useDataList<T = Record<string, unknown>>(options: UseDataListOptions): UseDataListReturn<T> {
  const {
    endpoint,
    pageSize: defaultPageSize = 20,
    deleteConfirmMessage = 'Delete this item?',
    deleteSuccessMessage = 'Item deleted',
  } = options;

  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(defaultPageSize);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');

  const toast = useToast();
  const confirm = useConfirm();

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(endpoint, { params: { page, limit: pageSize, search } });
      const r = res.data as ApiResponse<{ items: T[]; total: number }>;
      if (r?.success) {
        const data = r.data;
        setItems(data?.items || []);
        setTotal(data?.total || 0);
      } else {
        throw new Error((r as { success: false; error?: { message?: string } }).error?.message || 'Failed to fetch list');
      }
    } catch (err: unknown) {
      const apiErr = handleApiError(err);
      setError(apiErr.message);
    } finally {
      setLoading(false);
    }
  }, [endpoint, page, pageSize, search]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const refetch = () => {
    void fetchList();
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm(deleteConfirmMessage);
    if (!ok) return;
    try {
      const res = await api.delete(`${endpoint}/${id}`);
      const r = res.data as ApiResponse<null>;
      if (r?.success) {
        toast.showToast(deleteSuccessMessage, 'success');
        refetch();
      } else {
        throw new Error((r as { success: false; error?: { message?: string } }).error?.message || 'Delete failed');
      }
    } catch (err: unknown) {
      const apiErr = handleApiError(err);
      toast.showToast(apiErr.message, 'error');
    }
  };

  return {
    items,
    loading,
    error,
    page,
    pageSize,
    total,
    search,
    setPage,
    setSearch,
    refetch,
    handleDelete,
  };
}
