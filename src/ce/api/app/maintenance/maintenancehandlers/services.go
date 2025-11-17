package maintenancehandlers

import (
	"github.com/stormkit-io/stormkit-io/src/ce/api/app"
	"github.com/stormkit-io/stormkit-io/src/lib/shttp"
)

// Services sets the handlers for the maintenance service.
func Services(r *shttp.Router) *shttp.Service {
	s := r.NewService()

	opts := &app.Opts{Env: true}

	s.NewEndpoint("/maintenance").
		Handler(shttp.MethodGet, "/config", app.WithApp(handlerMaintenanceConfigGet, opts)).
		Handler(shttp.MethodPost, "/config", app.WithApp(handlerMaintenanceConfigSet, opts))

	return s
}
