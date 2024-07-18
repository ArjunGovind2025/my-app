import React from 'react';
import './SchoolDashboard.css'
import ScholarshipTable from './ScholarshipTable'

const UserActivity = () => {
  return (
    <div className="css-r4ua5r">
      <ScholarshipTable />
      <div className="css-5h3jk2">
        <div align="center" direction="column" className="css-bcbi7i">
          <p className="chakra-text css-col4ly">User Conversion</p>
        </div>
        <div className="css-16ont44">
          <div className="css-1oyd63l">
            <p className="chakra-text css-12skbo2">User Activity</p>
          </div>
          <div className="css-g4yn1g">
            <div className="css-u6kgca">
              <table className="chakra-table css-wlrsyp" role="table">
                <thead className="css-0">
                  <tr role="row" className="css-0">
                    <th
                      colspan="1"
                      role="columnheader"
                      title="Toggle SortBy"
                      className="css-1ymzhfb"
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="css-1w7gwv1">USER NAME</div>
                    </th>
                    <th
                      colspan="1"
                      role="columnheader"
                      title="Toggle SortBy"
                      className="css-1ymzhfb"
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="css-1w7gwv1">EMAIL</div>
                    </th>
                    <th
                      colspan="1"
                      role="columnheader"
                      title="Toggle SortBy"
                      className="css-1ymzhfb"
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="css-1w7gwv1">USERNAME</div>
                    </th>
                    <th
                      colspan="1"
                      role="columnheader"
                      title="Toggle SortBy"
                      className="css-1ymzhfb"
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="css-1w7gwv1">JOIN DATE</div>
                    </th>
                  </tr>
                </thead>
                <tbody role="rowgroup" className="css-0"></tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserActivity;
