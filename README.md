# AssetFlow

**AssetFlow** is a role-based enterprise asset and resource management system built for the **Odoo Hackathon 2026**. It helps organizations manage assets, departments, employees, allocations, bookings, maintenance, audits, notifications, and reports from one centralized platform.

## Live Deployment

### [Open AssetFlow](https://odoo-hackathon-2026-j3lu.vercel.app/)

**GitHub Repository:**  
[https://github.com/karthikeyan-rj/odoo-hackathon-2026](https://github.com/karthikeyan-rj/odoo-hackathon-2026)

---

## Problem Statement

Many organizations manage assets using spreadsheets, emails, and disconnected tools. This creates problems such as:

- Duplicate or missing asset records
- Unclear asset ownership
- Double allocation
- Booking conflicts
- Delayed maintenance
- Poor audit visibility
- Limited accountability
- Difficulty generating reports

AssetFlow solves these problems by providing a single role-based system for tracking the complete lifecycle of organizational assets and shared resources.

---

## Main Features

- Secure login and JWT authentication
- Role-based dashboards and permissions
- Department and employee management
- Asset category management
- Asset registration and lifecycle tracking
- Automatic asset tag generation
- Asset allocation, return, and transfer workflows
- Shared resource booking with overlap prevention
- Maintenance request and approval workflow
- Asset audit cycles and discrepancy tracking
- Notifications and activity logs
- Reports and CSV export
- Responsive desktop and mobile interface

---

## Supported Roles

AssetFlow supports four roles:

| Role | Main Responsibilities |
|---|---|
| **Admin** | Organization setup, employee management, role assignment, audits, reports, and activity logs |
| **Asset Manager** | Asset registration, allocation, transfers, returns, maintenance, and operational reports |
| **Department Head** | Department assets, department bookings, requests, and department-level monitoring |
| **Employee** | Assigned assets, bookings, maintenance requests, transfers, returns, and notifications |

All users use the same login page. The dashboard, sidebar, data, and actions change automatically based on the authenticated user's role.

Newly registered users are assigned the **Employee** role. Only an Admin can promote users to Asset Manager or Department Head.

---

## Role-Based Dashboards

### Admin Dashboard

The Admin dashboard provides an organization-wide overview.

Features:

- View total users
- View active and inactive employees
- View departments
- View total assets
- View audit discrepancies
- Manage organization setup
- Manage employee roles
- View reports
- View activity logs
- View notifications

Admin quick actions:

- Manage Departments
- Manage Categories
- Manage Employees
- Create Audit Cycle
- View Reports

---

## Demo Login Credentials

Use the following accounts to test each role in AssetFlow:

| Name | Email | Password | Role | Department | Status |
|---|---|---|---|---|---|
| System Admin | admin@assetflow.local | `change_this_password` | Admin | Human Resources | Active |
| John Employee | john@assetflow.local | `change_this_password` | Employee | IT | Active |
| Asset Manager | manager@assetflow.local | `change_this_password` | Asset Manager | IT | Active |
| Department Head | depthead@assetflow.local | `change_this_password` | Department Head | Human Resources | Active |

> These credentials are intended only for demonstration and testing. Change the passwords before using the application in production.

### Asset Manager Dashboard

The Asset Manager dashboard focuses on daily asset operations.

Features:

- View available assets
- View allocated assets
- View assets under maintenance
- View pending transfers
- View pending returns
- View overdue allocations
- Register new assets
- Allocate assets
- Approve transfers
- Approve returns
- Review maintenance requests

Asset Manager quick actions:

- Register Asset
- Allocate Asset
- Review Transfers
- Review Returns
- Review Maintenance

---

### Department Head Dashboard

The Department Head dashboard displays information related only to the assigned department.

Features:

- View department assets
- View department allocations
- View department bookings
- View pending department requests
- View upcoming returns
- View overdue returns
- Book shared resources
- View department-level reports

Department Head quick actions:

- View Department Assets
- Book Resource
- Review Department Requests

---

### Employee Dashboard

The Employee dashboard provides a personal view of assigned resources and requests.

Features:

- View assigned assets
- View upcoming bookings
- View active maintenance requests
- View pending transfer requests
- View upcoming returns
- View overdue returns
- View unread notifications
- Request asset return
- Request asset transfer
- Book a resource
- Raise a maintenance request

Employee quick actions:

- Book Resource
- Raise Maintenance Request
- Request Transfer
- Request Return

---

## Authentication and Authorization

AssetFlow uses JWT-based authentication.

Authentication flow:

1. User enters email and password
2. Backend verifies the account
3. User role is loaded from MongoDB
4. Backend returns a JWT and safe user information
5. Frontend opens the correct role-based dashboard
6. Protected API routes validate the token and role

Security behavior:

- Passwords are hashed using bcrypt
- Invalid credentials return a generic error
- Inactive accounts are blocked
- Protected routes require a valid token
- Unauthorized roles receive a `403 Forbidden` response
- Users cannot select their role during login or signup
- Employees cannot access Admin or Asset Manager functions

---

## Organization Setup

### Department Management

Admins can:

- Create departments
- Edit department details
- Assign department heads
- Create parent and child department structures
- Activate or deactivate departments
- Preserve departments linked to historical records

### Asset Category Management

Admins can:

- Create asset categories
- Edit category information
- Activate or deactivate categories
- Define category-specific custom fields
- Configure text, number, and date fields

### Employee Directory

Admins can:

- Search employees
- View names, emails, roles, departments, and status
- Assign employees to departments
- Activate or deactivate accounts
- Promote Employees to Asset Manager
- Promote Employees to Department Head
- Change privileged users back to Employee

---

## Asset Management

Each asset can store:

- Asset name
- Asset tag
- Serial number
- Category
- Acquisition date
- Acquisition cost
- Condition
- Location
- Home department
- Bookable status
- Current status
- Attachments

Supported asset conditions:

- New
- Good
- Fair
- Poor
- Damaged

Supported asset statuses:

- Available
- Allocated
- Reserved
- Under Maintenance
- Lost
- Retired
- Disposed

Asset tags are automatically generated in this format:

```text
AF-0001
AF-0002
AF-0003
```

AssetFlow prevents duplicate asset tags and duplicate serial numbers.

---

## Asset Directory

The asset directory supports:

- Search by asset name
- Search by asset tag
- Search by serial number
- Filter by category
- Filter by status
- Filter by department
- Filter by location
- Filter by condition
- View current allocation
- View allocation history
- View maintenance history
- View booking availability

---

## Asset Allocation

Assets can be allocated to:

- Individual users
- Departments

Allocation information includes:

- Asset
- Assignee
- Allocated by
- Allocation date
- Expected return date
- Allocation status

Business rules:

- Only available assets can be allocated
- One asset can have only one active allocation
- Assets under maintenance cannot be allocated
- Double allocation is blocked
- Allocation history is preserved

Supported allocation statuses:

- Active
- Returned
- Transferred

---

## Asset Return Workflow

The return workflow:

1. Finds the active allocation
2. Records the return date
3. Stores condition notes
4. Marks the allocation as returned
5. Changes the asset status to available
6. Creates a notification
7. Creates an activity log entry

Overdue returns are calculated using the expected return date.

---

## Asset Transfer Workflow

Users can request asset transfers.

Transfer statuses:

```text
Requested → Approved
Requested → Rejected
```

When approved:

- Current allocation is marked as transferred
- A new active allocation is created
- Asset history is preserved
- The asset remains allocated
- Affected users receive notifications
- The action is recorded in activity logs

When rejected:

- Current allocation remains unchanged
- The request is marked as rejected
- The requester is notified

---

## Resource Booking

Bookable assets can be reserved for a selected time period.

Features:

- View bookable resources
- Create bookings
- Reschedule bookings
- Cancel bookings
- View upcoming bookings
- Prevent overlapping bookings
- Allow back-to-back bookings
- Ignore cancelled bookings when checking conflicts

Supported booking statuses:

- Upcoming
- Ongoing
- Completed
- Cancelled

Booking conflict rule:

```text
existing.startTime < requestedEndTime
AND
existing.endTime > requestedStartTime
AND
existing.status is not Cancelled
```

Assets with the following statuses cannot be booked:

- Under Maintenance
- Lost
- Retired
- Disposed

---

## Maintenance Management

Employees can raise maintenance requests for assigned assets.

Maintenance details include:

- Asset
- Requester
- Description
- Priority
- Attachment
- Status
- Approver
- Technician
- Resolution date

Priorities:

- Low
- Medium
- High
- Critical

Maintenance workflow:

```text
Pending
   ↓
Approved or Rejected
   ↓
Technician Assigned
   ↓
In Progress
   ↓
Resolved
```

Business rules:

- Only authorized users can approve maintenance
- Approved assets move to Under Maintenance
- Under-maintenance assets cannot be allocated or booked
- Invalid status transitions are blocked
- Resolved requests record the resolution date
- Maintenance history is preserved

---

## Asset Audits

Admins can create audit cycles for departments or locations.

Audit features:

- Create audit cycles
- Set department or location scope
- Assign auditors
- Add assets to an audit
- Record audit results
- Prevent duplicate asset entries
- Close audit cycles
- Lock closed audits
- Generate discrepancy reports
- Mark missing assets as lost
- Create maintenance requests for damaged assets

Audit results:

- Pending
- Verified
- Missing
- Damaged

---

## Notifications

Users receive notifications for important events such as:

- Asset assigned
- Transfer requested
- Transfer approved
- Transfer rejected
- Booking confirmed
- Booking cancelled
- Booking reminder
- Maintenance approved
- Maintenance rejected
- Overdue return
- Audit discrepancy

Notification features:

- View newest notifications first
- View unread notifications
- Mark a notification as read
- Mark all notifications as read
- Users can access only their own notifications

---

## Activity Logs

AssetFlow records important actions, including:

- User registration
- Role changes
- Department changes
- Category changes
- Asset creation and editing
- Asset allocation
- Asset return
- Transfer request and review
- Booking creation
- Booking cancellation
- Booking rescheduling
- Maintenance actions
- Audit actions

Activity logs are append-only and provide a permanent history of system activity.

---

## Reports and Analytics

AssetFlow supports reports such as:

- Asset utilization
- Most-used assets
- Idle assets
- Maintenance frequency by asset
- Maintenance frequency by category
- Assets under maintenance
- Lost assets
- Retired assets
- Department allocation summary
- Active allocations
- Overdue allocations
- Resource booking usage
- Peak booking periods
- Audit discrepancies

CSV export is supported where available.

---

## Technology Stack

### Frontend

- React
- Vite
- JavaScript
- React Router
- CSS

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Token
- bcrypt

### Deployment

- Frontend: Vercel
- Database: MongoDB

---

## Project Structure

```text
odoo-hackathon-2026/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── services/
│   ├── utils/
│   ├── index.js
│   └── package.json
│
├── README.md
├── package.json
└── LICENSE
```

---

## Local Setup

### Prerequisites

Install:

- Node.js
- npm
- MongoDB
- Git

---

### Clone the Repository

```bash
git clone https://github.com/karthikeyan-rj/odoo-hackathon-2026.git
cd odoo-hackathon-2026
```

---

### Backend Setup

```bash
cd server
npm install
```

Create a `.env` file inside the `server` folder:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/assetflow
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=8h
CLIENT_URL=http://localhost:5173
DEV_EXPOSE_RESET_TOKEN=false
```

Start the backend:

```bash
npm start
```

Backend URL:

```text
http://localhost:5000
```

---

### Frontend Setup

Open another terminal:

```bash
cd client
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

---

## Production Build

```bash
cd client
npm run build
```

The production-ready frontend files will be created inside:

```text
client/dist
```

---

## Important Business Rules

- Every newly registered user starts as an Employee
- Only Admin can assign privileged roles
- An asset can have only one active allocation
- Unavailable assets cannot be allocated
- Under-maintenance assets cannot be booked
- Booking overlaps are rejected
- Back-to-back bookings are allowed
- Closed audits are read-only
- Missing audited assets become Lost
- Users can view only their own notifications
- Department Heads can view only department-scoped data
- Employees can view only their personal data
- Backend permissions are enforced even when frontend links are hidden

---

## Future Improvements

- Email-based password reset
- File storage integration
- PDF report export
- Advanced charts and analytics
- Real-time notifications
- QR or barcode scanning
- Mobile application
- Cloud deployment for the backend

---

## Live Demo

### [https://odoo-hackathon-2026-j3lu.vercel.app/](https://odoo-hackathon-2026-j3lu.vercel.app/)

---

## License

This project is licensed under the terms provided in the repository's `LICENSE` file.

---

## Team

Developed for the **Odoo Hackathon 2026**.
