import { useSession } from "../context/session";

export function useProducts() {
  const encodedContext = useSession();

  console.log(encodedContext);
}
