import { useCallback, useEffect, useState } from 'react';
import api from '../utils/api';
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
      const data = res.data?.data;
      setItems(data?.items || []);
      setTotal(data?.total || 0);
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
      await api.delete(`${endpoint}/${id}`);
      toast.showToast(deleteSuccessMessage, 'success');
      refetch();
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
