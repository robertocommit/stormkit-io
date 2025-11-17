import { FormEventHandler, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import LensIcon from "@mui/icons-material/Lens";
import Card from "~/components/Card";
import CardHeader from "~/components/CardHeader";
import CardFooter from "~/components/CardFooter";
import {
  updateMaintenanceConfig,
  useFetchMaintenanceConfig,
} from "./actions";

interface Props {
  app: App;
  environment: Environment;
}

export default function TabMaintenanceMode({ app, environment: env }: Props) {
  const [refreshToken, setRefreshToken] = useState<number>();
  const [formError, setFormError] = useState<string>();
  const [sendLoading, setSendLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<string>();
  const [maintenance, setMaintenance] = useState<boolean>(false);
  const { loading, error, maintenance: fetchedMaintenance } =
    useFetchMaintenanceConfig({
      appId: app.id,
      envId: env.id!,
      refreshToken,
    });

  useEffect(() => {
    setMaintenance(Boolean(fetchedMaintenance));
  }, [fetchedMaintenance]);

  const submitHandler: FormEventHandler = e => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = Object.fromEntries(new FormData(form).entries());

    const isMaintenanceEnabled = data.maintenance === "on";

    setSendLoading(true);

    updateMaintenanceConfig({
      appId: app.id,
      envId: env.id!,
      maintenance: isMaintenanceEnabled,
    })
      .then(() => {
        setMaintenance(isMaintenanceEnabled);
        setRefreshToken(Date.now());
        setSuccess("Maintenance mode updated successfully.");
        setFormError(undefined);
      })
      .catch(async e => {
        let message =
          "Something went wrong while updating the maintenance configuration.";

        if (e instanceof Response) {
          try {
            const data = await e.json();
            message = data.error || message;
          } catch {
            const text = await e.text().catch(() => "");
            message = text || message;
          }
        }

        setFormError(message);
      })
      .finally(() => {
        setSendLoading(false);
      });
  };

  return (
    <Card
      id="maintenance"
      component="form"
      loading={loading}
      error={error || formError}
      success={success}
      onSubmit={submitHandler}
      sx={{ mb: 4 }}
    >
      <CardHeader
        title="Maintenance mode"
        subtitle="Serve a maintenance page to visitors while you work on the deployment."
        actions={
          <Box sx={{ alignSelf: "flex-start" }}>
            <LensIcon
              color={maintenance ? "success" : "error"}
              sx={{ width: 12 }}
            />
            <Typography component="span" sx={{ ml: 1, fontSize: 12 }}>
              {maintenance ? "Enabled" : "Disabled"}
            </Typography>
          </Box>
        }
      />
      <FormControl variant="standard" fullWidth sx={{ mb: 4 }}>
        <InputLabel id="app-runtime-maintenance" sx={{ pl: 2, pt: 1 }}>
          Status
        </InputLabel>
        <Select
          labelId="app-runtime-maintenance"
          variant="filled"
          name="maintenance"
          value={maintenance ? "on" : "off"}
          onChange={event => setMaintenance(event.target.value === "on")}
          sx={{ minWidth: 250 }}
        >
          <MenuItem value={"off"}>Maintenance mode is disabled</MenuItem>
          <MenuItem value={"on"}>Show the maintenance page to visitors</MenuItem>
        </Select>
      </FormControl>
      <CardFooter>
        <Button
          type="submit"
          variant="contained"
          color="secondary"
          loading={sendLoading}
        >
          Save
        </Button>
      </CardFooter>
    </Card>
  );
}
