import useSWR from "swr";
import { fetchTransactions } from "../api/transactionApi";

const swrFetcher = async () => await fetchTransactions();

export default function useTransactions() {
  const { data, error, isLoading } = useSWR("transactions", swrFetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 30000, // avoid refetching for 30 seconds
  });

  return {
    grouped: data || [],
    isLoading,
    error,
  };
}
