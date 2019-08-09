import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import RegistrationForm from "../components/RegistrationForm";
import PrivateRoute from "../components/PrivateRoute";

import Users from "../components/utils/Users";
import UpdatePasswordForm from "../components/utils/UpdatePasswordForm";
import PublicRoute from "../components/PublicRoute";

import SettingForm from "../components/pas/SettingForm";
import ResearchCategoriesForm from "../components/cre/ResearchCategoriesForm";
import ResearchAgendaForm from "../components/cre/ResearchAgendaForm";
import PresentationCategoriesForm from "../components/cre/PresentationCategoriesForm";
import ResearchesForm from "../components/urc/ResearchesForm";
import AcademicYearForm from "../components/cre/AcademicYearForm";
import CollegeForm from "../components/cre/CollegeForm";
import AttachmentCategoriesForm from "../components/cre/AttachmentCategoriesForm";
import FacultyForm from "../components/cre/FacultyForm";
import SiteMap from "../components/tdc/SiteMap";
import LotInformationForm from "../components/tde/LotInformationForm";
import OperatingRoomSlipForm from "../components/clmmrh/OperatingRoomSlipForm";
import SurgeonForm from "../components/clmmrh/SurgeonForm";
import AnesForm from "../components/clmmrh/AnesForm";
import NurseForm from "../components/clmmrh/NurseForm";
import MainDisplay from "../components/clmmrh/MainDisplay";
import ORLogs from "../components/clmmrh/ORLogs";
import RelativeValueScaleForm from "../components/clmmrh/RelativeValueScaleForm";

const AppRouter = () => (
  <BrowserRouter>
    <div className="is-full-height">
      <Switch>
        <PublicRoute path="/" component={LoginForm} exact={true} />
        <Route path="/login" component={LoginForm} exact={true} />

        <PrivateRoute path="/users" component={Users} exact={true} />
        <PrivateRoute path="/settings" component={SettingForm} exact={true} />

        <PrivateRoute path="/map" component={SiteMap} exact={true} />
        <PrivateRoute
          path="/or-slip"
          component={OperatingRoomSlipForm}
          exact={true}
        />

        <PrivateRoute path="/or-logs" component={ORLogs} exact={true} />

        <PrivateRoute path="/surgeons" component={SurgeonForm} exact={true} />
        <PrivateRoute path="/nurses" component={NurseForm} exact={true} />
        <PrivateRoute
          path="/relative-value-scales"
          component={RelativeValueScaleForm}
          exact={true}
        />
        <PrivateRoute
          path="/anesthesiologists"
          component={AnesForm}
          exact={true}
        />

        <PrivateRoute
          path="/update-password"
          component={UpdatePasswordForm}
          exact={true}
        />
      </Switch>

      <Route path="/register" component={RegistrationForm} exact={true} />
      <Route path="/main-display" component={MainDisplay} exact={true} />
    </div>
  </BrowserRouter>
);

export default AppRouter;
