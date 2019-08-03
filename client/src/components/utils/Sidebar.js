import React from "react";
import { NavLink } from "react-router-dom";
import isEmpty from "./../../validation/is-empty";
import { USER_ADMIN } from "./../../utils/constants";

export default ({ auth }) => {
  return (
    <aside className="menu">
      <p className="menu-label">General</p>
      <ul className="menu-list">
        <li>
          <a>Dashboard</a>
        </li>
        <li>
          <NavLink activeClassName="is-active" to="/users/update-password">
            Change Password
          </NavLink>
        </li>
      </ul>
      <p className="menu-label">Masterfiles</p>
      <ul className="menu-list">
        <li>
          <NavLink activeClassName="is-active" to="/documents">
            Documents
          </NavLink>
        </li>
        <li>
          <NavLink activeClassName="is-active" to="/customers">
            Customers
          </NavLink>
        </li>
        <li>
          <NavLink activeClassName="is-active" to="/chart-of-accounts">
            Chart of Accounts
          </NavLink>
        </li>
        <li>
          <NavLink activeClassName="is-active" to="/banks">
            Banks
          </NavLink>
        </li>
        <li>
          <NavLink activeClassName="is-active" to="/users" exact={true}>
            Users
          </NavLink>
        </li>
      </ul>
      <p className="menu-label">Transactions</p>
      <ul className="menu-list">
        <li>
          <NavLink activeClassName="is-active" to="/loans">
            Loans
          </NavLink>
        </li>
        <li>
          <NavLink activeClassName="is-active" to="/collections">
            Collections
          </NavLink>
        </li>
        <li>
          <NavLink activeClassName="is-active" to="/cash-advances">
            Cash Advances
          </NavLink>
        </li>
        <li>
          <NavLink activeClassName="is-active" to="/discounted-loans">
            Add-on Loans
          </NavLink>
        </li>

        <li>
          <NavLink activeClassName="is-active" to="/expense-vouchers">
            Expense Vouchers
          </NavLink>
        </li>
      </ul>

      {!isEmpty(auth.user) && auth.user.role.value === USER_ADMIN && (
        <div>
          <p className="menu-label">Reports</p>
          <ul className="menu-list">
            <li>
              <NavLink activeClassName="is-active" to="/reports/availment">
                Availment Report
              </NavLink>
            </li>
            <li>
              <NavLink activeClassName="is-active" to="/reports/collection">
                Collection Report
              </NavLink>
            </li>
            <li>
              <NavLink activeClassName="is-active" to="/reports/addon-loans">
                Add-on Loans Report
              </NavLink>
            </li>
            <li>
              <NavLink activeClassName="is-active" to="/reports/cash-advances">
                Cash Advances Report
              </NavLink>
            </li>
            <li>
              <NavLink
                activeClassName="is-active"
                to="/reports/expense-vouchers"
              >
                Expense Vouchers Report
              </NavLink>
            </li>
            <li>
              <NavLink activeClassName="is-active" to="/reports/aging-of-ar">
                Aging of A/R
              </NavLink>
            </li>
          </ul>
        </div>
      )}
    </aside>
  );
};
