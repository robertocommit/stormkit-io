import type { RenderResult } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, waitFor, fireEvent } from "@testing-library/react";
import mockApp from "~/testing/data/mock_app";
import mockEnvironment from "~/testing/data/mock_environment";
import * as actions from "~/testing/nocks/nock_maintenance";
import TabMaintenanceMode from "./TabMaintenanceMode";

const { mockFetchMaintenanceConfig, mockUpdateMaintenanceConfig } = actions;

describe(
  "~/pages/apps/[id]/environments/[env-id]/config/_components/TabMaintenanceMode/TabMaintenanceMode.tsx",
  () => {
    let wrapper: RenderResult;
    let app: App;
    let env: Environment;

    beforeEach(() => {
      app = mockApp();
      env = mockEnvironment({ app });
    });

    const createWrapper = () => {
      wrapper = render(<TabMaintenanceMode app={app} environment={env} />);
    };

    it.each`
      maintenance | selectedItem                            | expectedStatus
      ${true}     | ${"Show the maintenance page to visitors"} | ${"Enabled"}
      ${false}    | ${"Maintenance mode is disabled"}          | ${"Disabled"}
    `(
      "selects the correct dropdown item based on the API response",
      async ({ maintenance, selectedItem, expectedStatus }) => {
        const scope = mockFetchMaintenanceConfig({
          appId: app.id,
          envId: env.id!,
          response: { maintenance },
        });

        createWrapper();
        expect(wrapper.getByTestId("card-loading")).toBeTruthy();

        await waitFor(() => {
          expect(scope.isDone()).toBe(true);
          expect(() => wrapper.getByTestId("card-loading")).toThrow();
          expect(wrapper.getByText(selectedItem)).toBeTruthy();
          expect(wrapper.getByText(expectedStatus)).toBeTruthy();
        });
      }
    );

    it("updates maintenance status when saved", async () => {
      const fetchScope = mockFetchMaintenanceConfig({
        appId: app.id,
        envId: env.id!,
        response: { maintenance: true },
      });

      createWrapper();

      await waitFor(() => {
        expect(fetchScope.isDone()).toBe(true);
      });

      const updateScope = mockUpdateMaintenanceConfig({
        appId: app.id,
        envId: env.id!,
        maintenance: true,
      });

      fireEvent.click(wrapper.getByText("Save"));

      await waitFor(() => {
        expect(updateScope.isDone()).toBe(true);
        expect(
          wrapper.getByText("Maintenance mode updated successfully.")
        ).toBeTruthy();
      });
    });
  }
);
