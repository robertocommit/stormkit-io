import { useEffect, useState } from "react";
import api from "~/utils/api/Api";

interface UseFetchMaintenanceConfig {
  appId: string;
  envId: string;
  refreshToken?: number;
}

export const useFetchMaintenanceConfig = ({
  appId,
  envId,
  refreshToken,
}: UseFetchMaintenanceConfig) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>();
  const [maintenance, setMaintenance] = useState<boolean>(false);

  useEffect(() => {
    let isCancelled = false;

    setLoading(true);
    setError(undefined);

    api
      .fetch<{ maintenance: boolean } | Response>(
        `/maintenance/config?appId=${appId}&envId=${envId}`
      )
      .then(async response => {
        if (response instanceof Response) {
          const contentType = response.headers.get("content-type") || "";

          if (!contentType.includes("application/json")) {
            throw new Error("Unexpected response type");
          }

          return response.json();
        }

        return response;
      })
      .then(({ maintenance }) => {
        if (isCancelled) return;

        setMaintenance(Boolean(maintenance));
      })
      .catch(() => {
        if (isCancelled) return;

        setError(
          "Something went wrong while fetching the maintenance configuration"
        );
      })
      .finally(() => {
        if (isCancelled) return;

        setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [appId, envId, refreshToken]);

  return { loading, error, maintenance };
};

interface UpdateMaintenanceConfigProps {
  appId: string;
  envId: string;
  maintenance: boolean;
}

export const updateMaintenanceConfig = ({
  appId,
  envId,
  maintenance,
}: UpdateMaintenanceConfigProps) => {
  return api.post("/maintenance/config", {
    appId,
    envId,
    maintenance,
  });
};
