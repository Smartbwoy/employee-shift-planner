import { QueryClient } from "@tanstack/react-query";
export const retryQuery = (count, error) => ![400, 401, 403, 404, 409, 422, 429].includes(error?.status) && count < 1;
export const createQueryClient = () => new QueryClient({ defaultOptions: { queries: { retry: retryQuery, staleTime: 15_000 }, mutations: { retry: false } } });
