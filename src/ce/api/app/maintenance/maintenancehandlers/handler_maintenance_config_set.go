package maintenancehandlers

import (
	"github.com/stormkit-io/stormkit-io/src/ce/api/app"
	"github.com/stormkit-io/stormkit-io/src/ce/api/app/appcache"
	"github.com/stormkit-io/stormkit-io/src/ce/api/app/maintenance"
	"github.com/stormkit-io/stormkit-io/src/lib/shttp"
)

type MaintenanceConfigSetRequest struct {
	Maintenance bool `json:"maintenance"`
}

func handlerMaintenanceConfigSet(req *app.RequestContext) *shttp.Response {
	data := MaintenanceConfigSetRequest{}

	if err := req.Post(&data); err != nil {
		return shttp.Error(err)
	}

	store := maintenance.Store()

	if err := store.SetMaintenance(req.Context(), req.EnvID, data.Maintenance); err != nil {
		return shttp.Error(err)
	}

	if err := appcache.Service().Reset(req.EnvID); err != nil {
		return shttp.Error(err)
	}

	return shttp.OK()
}
