package hosting

import (
	"net/http"

	"github.com/stormkit-io/stormkit-io/src/lib/html"
	"github.com/stormkit-io/stormkit-io/src/lib/shttp"
)

// WithMaintenance checks whether the environment is in maintenance mode and, if so,
// returns the default maintenance page for public traffic.
func WithMaintenance(req *RequestContext) (*shttp.Response, error) {
	if req.Host == nil || req.Host.Config == nil || !req.Host.Config.Maintenance {
		return nil, nil
	}

	content := html.MustRender(html.RenderArgs{
		PageTitle:   "Stormkit - Maintenance",
		PageContent: html.Templates["maintenance"],
		ContentData: map[string]any{"app_name": req.Host.Name},
	})

	return &shttp.Response{
		Status: http.StatusServiceUnavailable,
		Data:   content,
		Headers: http.Header{
			"Content-Type": []string{"text/html; charset=utf-8"},
		},
	}, nil
}
