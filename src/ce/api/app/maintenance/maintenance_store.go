package maintenance

import (
	"context"

	"github.com/stormkit-io/stormkit-io/src/lib/database"
	"github.com/stormkit-io/stormkit-io/src/lib/types"
)

var stmt = struct {
	setMaintenance string
	getMaintenance string
}{
	setMaintenance: `
                UPDATE apps_build_conf SET maintenance_mode = $1 WHERE env_id = $2;
        `,
	getMaintenance: `
                SELECT maintenance_mode FROM apps_build_conf WHERE env_id = $1;
        `,
}

type store struct {
	*database.Store
}

// Store returns a store instance.
func Store() *store {
	return &store{database.NewStore()}
}

// SetMaintenance updates the maintenance flag for a given environment.
func (s *store) SetMaintenance(ctx context.Context, envID types.ID, enabled bool) error {
	_, err := s.Exec(ctx, stmt.setMaintenance, enabled, envID)
	return err
}

// Maintenance returns the maintenance flag for a given environment.
func (s *store) Maintenance(ctx context.Context, envID types.ID) (bool, error) {
	row, err := s.QueryRow(ctx, stmt.getMaintenance, envID)

	if err != nil {
		return false, err
	}

	if row == nil {
		return false, nil
	}

	var enabled bool

	if err := row.Scan(&enabled); err != nil {
		return false, err
	}

	return enabled, nil
}
