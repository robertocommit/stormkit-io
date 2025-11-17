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
    api
      .fetch<{ maintenance: boolean }>(
        `/maintenance/config?appId=${appId}&envId=${envId}`
      )
      .then(({ maintenance }) => {
        setMaintenance(maintenance);
      })
      .catch(() => {
        setError(
          "Something went wrong while fetching the maintenance configuration"
        );
      })
      .finally(() => {
        setLoading(false);
      });
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
