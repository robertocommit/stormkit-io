package maintenancehandlers

import (
	"net/http"

	"github.com/stormkit-io/stormkit-io/src/ce/api/app"
	"github.com/stormkit-io/stormkit-io/src/ce/api/app/maintenance"
	"github.com/stormkit-io/stormkit-io/src/lib/shttp"
)

func handlerMaintenanceConfigGet(req *app.RequestContext) *shttp.Response {
	enabled, err := maintenance.Store().Maintenance(req.Context(), req.EnvID)

	if err != nil {
		return shttp.Error(err)
	}

	return &shttp.Response{
		Status: http.StatusOK,
		Data: map[string]any{
			"maintenance": enabled,
		},
	}
}
