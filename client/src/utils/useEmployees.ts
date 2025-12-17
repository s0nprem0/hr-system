import { useDataList } from './useDataList';

export function useEmployees(options?: { pageSize?: number }) {
  return useDataList({ endpoint: '/api/employees', pageSize: options?.pageSize ?? 20 });
}

export default useEmployees;
