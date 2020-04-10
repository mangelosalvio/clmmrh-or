import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import RegistrationForm from "../components/RegistrationForm";
import PrivateRoute from "../components/PrivateRoute";

import Users from "../components/utils/Users";
import UpdatePasswordForm from "../components/utils/UpdatePasswordForm";
import PublicRoute from "../components/PublicRoute";

import SettingForm from "../components/pas/SettingForm";
import OperatingRoomSlipForm from "../components/clmmrh/OperatingRoomSlipForm";
import SurgeonForm from "../components/clmmrh/SurgeonForm";
import AnesForm from "../components/clmmrh/AnesForm";
import NurseForm from "../components/clmmrh/NurseForm";
import MainDisplay from "../components/clmmrh/MainDisplay";
import ORLogs from "../components/clmmrh/ORLogs";
import RelativeValueScaleForm from "../components/clmmrh/RelativeValueScaleForm";
import SurgicalMemorandumReport from "../components/clmmrh/SurgicalMemorandumReport";
import ORElectiveOperations from "../components/clmmrh/ORElectiveOperations";
import ORScheduleForm from "../components/clmmrh/ORScheduleForm";
import OptechSelectionForm from "../components/clmmrh/OptechSelectionForm";
import OptechReport from "../components/clmmrh/OptechReport";
import RoomStatistics from "../components/clmmrh/RoomStatistics";
import ORElectiveForm from "../components/pas/ORElectiveForm";

const AppRouter = () => (
  <BrowserRouter>
    <div className="is-full-height">
      <Switch>
        <PublicRoute path="/" component={LoginForm} exact={true} />
        <Route path="/login" component={LoginForm} exact={true} />

        <PrivateRoute path="/users" component={Users} exact={true} />
        <PrivateRoute path="/settings" component={SettingForm} exact={true} />
        <PrivateRoute
          path="/or-slip"
          component={OperatingRoomSlipForm}
          exact={true}
        />

        <PrivateRoute path="/or-logs" component={ORLogs} exact={true} />

        <PrivateRoute
          path="/room-statistics"
          component={RoomStatistics}
          exact={true}
        />

        <PrivateRoute path="/surgeons" component={SurgeonForm} exact={true} />
        <PrivateRoute path="/nurses" component={NurseForm} exact={true} />
        <PrivateRoute
          path="/relative-value-scales"
          component={RelativeValueScaleForm}
          exact={true}
        />

        <PrivateRoute
          path="/optech-selections"
          component={OptechSelectionForm}
          exact={true}
        />

        <PrivateRoute
          path="/anesthesiologists"
          component={AnesForm}
          exact={true}
        />

        <PrivateRoute
          path="/or-schedules"
          component={ORScheduleForm}
          exact={true}
        />

        <PrivateRoute
          path="/update-password"
          component={UpdatePasswordForm}
          exact={true}
        />

        <Route
          path="/or-slip/:id/surgical-memorandum"
          component={SurgicalMemorandumReport}
          exact={true}
        />

        <Route
          path="/or-slip/:id/surgical-memorandum/:surg_memo_id"
          component={SurgicalMemorandumReport}
          exact={true}
        />

        <Route
          path="/or-slip/:id/optech/:surg_memo_id"
          component={OptechReport}
          exact={true}
        />

        <Route
          path="/or-elective-operations/:date"
          component={ORElectiveOperations}
          exact={true}
        />

        <Route
          path="/or-elective-operations"
          component={ORElectiveOperations}
          exact={true}
        />

        <PrivateRoute
          path="/or-elective-form"
          component={ORElectiveForm}
          exact={true}
        />

        <Route
          path="/or-slip/:id/operative-technique"
          component={OptechReport}
          exact={true}
        />
        <Route
          path="/or-slip/:id/operative-technique/:optech_index"
          component={OptechReport}
          exact={true}
        />
      </Switch>

      <Route path="/register" component={RegistrationForm} exact={true} />
      <Route path="/main-display" component={MainDisplay} exact={true} />
    </div>
  </BrowserRouter>
);

export default AppRouter;
