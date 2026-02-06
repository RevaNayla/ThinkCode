import { useEffect, useState } from "react";
import { apiGet } from "../services/api";

export default function useFetch(path, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiGet(path)
      .then((d) => mounted && setData(d))
      .catch((e) => mounted && setError(e.message || e))
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, deps); 

  return { data, loading, error };
}
