import React from "react";
import { Route, Redirect, Link } from "react-router-dom";
import { connect } from "react-redux";

import { Layout, Menu, Icon, Tooltip } from "antd";
import Sider from "antd/lib/layout/Sider";
import { USER_ADMIN, USER_WARD } from "./../utils/constants";
import { logoutUser } from "../actions/authActions";
import companyLogo from "./../images/clmmrh.png";

const { SubMenu } = Menu;
const { Content } = Layout;

const PrivateRoute = ({ component: Component, logoutUser, auth, ...rest }) => (
  <Layout className="is-full-height">
    <Sider
      style={{
        overflow: "auto",
        height: "100vh",
        position: "fixed",
        left: 0,
        marginTop: "0px",
      }}
    >
      <div className="logo">
        <div>
          <img src={companyLogo} alt="logo" />
        </div>
        {/* <span>SITE MANAGEMENT SYSTEM</span> */}
        <div style={{ marginTop: "16px" }}>
          <Icon type="user" style={{ fontSize: "10px" }} />{" "}
          <span
            style={{
              fontSize: "10px",
            }}
          >
            {auth.user.name}
          </span>
        </div>
      </div>
      <Menu theme="dark" mode="inline" defaultSelectedKeys={["4"]}>
        <Menu.Item key="1">
          <Link to="/or-slip">
            <span>
              <Icon type="dashboard" />
              Dashboard
            </span>
          </Link>
        </Menu.Item>

        {auth.user.role !== USER_WARD && [
          <SubMenu
            key="sub1"
            title={
              <span>
                <Icon type="container" />
                Master Files
              </span>
            }
          >
            <Menu.Item key="/surgeons">
              <Link to="/surgeons">
                <span>
                  <Icon type="folder" />
                  Surgeons
                </span>
              </Link>
            </Menu.Item>
            <Menu.Item key="/anesthesiologists">
              <Link to="/anesthesiologists">
                <span>
                  <Icon type="folder" />
                  Anesthesiologists
                </span>
              </Link>
            </Menu.Item>
            <Menu.Item key="/nurses">
              <Link to="/nurses">
                <span>
                  <Icon type="folder" />
                  Nurses
                </span>
              </Link>
            </Menu.Item>
            <Menu.Item key="/relative-value-scales">
              <Link to="/relative-value-scales">
                <span>
                  <Icon type="folder" />
                  RVS
                </span>
              </Link>
            </Menu.Item>
            <Menu.Item key="/optech-selections">
              <Link to="/optech-selections">
                <span>
                  <Icon type="folder" />
                  Optech Selections
                </span>
              </Link>
            </Menu.Item>
          </SubMenu>,
          <SubMenu
            key="sub2"
            title={
              <span>
                <Icon type="profile" />
                Reports
              </span>
            }
          >
            <Menu.Item key="/or-logs">
              <Link to="/or-logs">
                <span>
                  <Icon type="folder" />
                  OR Logs
                </span>
              </Link>
            </Menu.Item>
            <Menu.Item key="/room-statistics">
              <Link to="/room-statistics">
                <span>
                  <Icon type="folder" />
                  Room Statistics
                </span>
              </Link>
            </Menu.Item>
            <Menu.Item key="/or-monthly-report">
              <Link to="/or-monthly-report">
                <span>
                  <Icon type="folder" />
                  OR Monthly Report
                </span>
              </Link>
            </Menu.Item>
            <Menu.Item key="/summary-of-operations-per-department">
              <Tooltip
                title="Summary of Operations per Department"
                placement="right"
              >
                <Link to="/summary-of-operations-per-department">
                  <span>
                    <Icon type="folder" />
                    Summary of Operations per Department
                  </span>
                </Link>
              </Tooltip>
            </Menu.Item>
            <Menu.Item key="/operations-summary">
              <Tooltip title="Summary of Operations" placement="right">
                <Link to="/operations-summary">
                  <span>
                    <Icon type="folder" />
                    Summary of Operations
                  </span>
                </Link>
              </Tooltip>
            </Menu.Item>
          </SubMenu>,
          <Menu.Item key="/or-schedules">
            <Link to="/or-schedules">
              <span>
                <Icon type="appstore" />
                OR Schedule
              </span>
            </Link>
          </Menu.Item>,

          <Menu.Item key="/or-elective-form">
            <Link to="/or-elective-form">
              <span>
                <Icon type="appstore" />
                OR Elective Op
              </span>
            </Link>
          </Menu.Item>,
        ]}

        <Menu.Item key="/main-display">
          <Link to="/main-display">
            <span>
              <Icon type="appstore" />
              Schedule Display
            </span>
          </Link>
        </Menu.Item>

        {auth.user && auth.user.role === USER_ADMIN && (
          <Menu.Item key="5">
            <Link to="/users">
              <span>
                <Icon type="user" />
                Users
              </span>
            </Link>
          </Menu.Item>
        )}

        <Menu.Item key="10">
          <Link to="/update-password">
            <span>
              <Icon type="key" />
              Update Password
            </span>
          </Link>
        </Menu.Item>

        <Menu.Item onClick={() => logoutUser()}>
          <span>
            <Icon type="logout" />
            Logout
          </span>
        </Menu.Item>
      </Menu>
    </Sider>
    <Layout style={{ marginLeft: 200 }} className="is-full-height">
      <Content style={{ overflow: "auto" }} className="is-full-height">
        <Route
          {...rest}
          render={(props) =>
            auth.isAuthenticated === true ? (
              <Component {...props} />
            ) : (
              <Redirect to="/login" />
            )
          }
        />
      </Content>
    </Layout>
  </Layout>
);

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps, { logoutUser })(PrivateRoute);
