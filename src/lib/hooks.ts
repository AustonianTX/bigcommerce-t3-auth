import { useQuery } from "react-query";
import { useSession } from "../context/session";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useProducts() {
  const encodedContext = useSession()?.context;

  const { data, error } = useSWR(
    `/api/products?context=${encodedContext}`,
    fetcher
  );
}
