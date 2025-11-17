package maintenancehandlers_test

import (
        "context"
        "net/http"
        "testing"

        "github.com/stormkit-io/stormkit-io/src/ce/api/admin"
        "github.com/stormkit-io/stormkit-io/src/ce/api/app/appcache"
        "github.com/stormkit-io/stormkit-io/src/ce/api/app/maintenance"
        "github.com/stormkit-io/stormkit-io/src/ce/api/app/maintenance/maintenancehandlers"
        "github.com/stormkit-io/stormkit-io/src/ce/api/user/usertest"
        "github.com/stormkit-io/stormkit-io/src/lib/database/databasetest"
        "github.com/stormkit-io/stormkit-io/src/lib/factory"
        "github.com/stormkit-io/stormkit-io/src/lib/shttp"
        "github.com/stormkit-io/stormkit-io/src/lib/shttp/shttptest"
        "github.com/stormkit-io/stormkit-io/src/lib/types"
        "github.com/stormkit-io/stormkit-io/src/mocks"
        "github.com/stretchr/testify/suite"
)

type HandlerMaintenanceConfigSuite struct {
        suite.Suite
        *factory.Factory
        conn             databasetest.TestDB
        mockCacheService *mocks.CacheInterface
}

func (s *HandlerMaintenanceConfigSuite) BeforeTest(suiteName, _ string) {
        s.conn = databasetest.InitTx(suiteName)
        s.Factory = factory.New(s.conn)
        s.mockCacheService = &mocks.CacheInterface{}
        appcache.DefaultCacheService = s.mockCacheService
        admin.SetMockLicense()
}

func (s *HandlerMaintenanceConfigSuite) AfterTest(_, _ string) {
        s.conn.CloseTx()
        appcache.DefaultCacheService = nil
        admin.ResetMockLicense()
}

func (s *HandlerMaintenanceConfigSuite) Test_MaintenanceConfig_GetAndSet() {
        usr := s.MockUser()
        app := s.MockApp(usr)
        env := s.MockEnv(app)

        handler := shttp.NewRouter().RegisterService(maintenancehandlers.Services).Router().Handler()

        res := shttptest.RequestWithHeaders(
                handler,
                shttp.MethodGet,
                "/maintenance/config?envId="+env.ID.String(),
                nil,
                map[string]string{"authorization": usertest.Authorization(usr.ID)},
        )

        s.Equal(http.StatusOK, res.Code)
        s.Equal("{\"maintenance\":false}", res.Body.String())

        s.mockCacheService.On("Reset", types.ID(env.ID)).Return(nil).Once()

        res = shttptest.RequestWithHeaders(
                handler,
                shttp.MethodPost,
                "/maintenance/config",
                map[string]any{
                        "envId":       env.ID.String(),
                        "maintenance": true,
                },
                map[string]string{"authorization": usertest.Authorization(usr.ID)},
        )

        s.Equal(http.StatusOK, res.Code)

        enabled, err := maintenance.Store().Maintenance(context.Background(), env.ID)
        s.NoError(err)
        s.True(enabled)
}

func TestHandlerMaintenanceConfigSuite(t *testing.T) {
        suite.Run(t, &HandlerMaintenanceConfigSuite{})
}
