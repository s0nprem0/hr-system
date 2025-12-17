import { useDataList } from './useDataList';

export function useDepartments(options?: { pageSize?: number }) {
  return useDataList({ endpoint: '/api/departments', pageSize: options?.pageSize ?? 25 });
}

export default useDepartments;
