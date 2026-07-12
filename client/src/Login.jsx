import React from 'react'
import { useNavigate } from 'react-router-dom'

// dummy login - will replace with real api later
const roles = [
  {
    role: 'Admin',
    name: 'Admin User',
    email: 'admin@assetflow.local',
    description: 'Manage users, departments and audit logs'
  },
  {
    role: 'AssetManager',
    name: 'Asset Manager',
    email: 'manager@assetflow.local',
    description: 'Add assets, handle allocations and transfers'
  },
  {
    role: 'DepartmentHead',
    name: 'Department Head',
    email: 'depthead@assetflow.local',
    description: 'View team assets and approve requests'
  },
  {
    role: 'Employee',
    name: 'John Employee',
    email: 'john@assetflow.local',
    description: 'View my assets, book resources, raise maintenance'
  }
]

function Login() {
  const navigate = useNavigate()

  function selectRole(user) {
    localStorage.setItem('token', 'dummy-' + user.role)
    localStorage.setItem('user', JSON.stringify(user))
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-zinc-900">AssetFlow</h1>
        <p className="text-xs text-zinc-500 mt-1">Pick a role to continue (dummy auth for now)</p>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        {roles.map(function(user) {
          return (
            <button
              key={user.role}
              onClick={function() { selectRole(user) }}
              className="text-left p-5 bg-white border border-zinc-200 rounded-lg hover:border-zinc-400 hover:shadow-sm transition"
            >
              <div className="text-sm font-semibold text-zinc-900">{user.name}</div>
              <div className="text-[10px] text-zinc-400 mt-1 font-mono">{user.role}</div>
              <div className="text-xs text-zinc-500 mt-2">{user.description}</div>
            </button>
          )
        })}
      </div>

      <p className="text-[10px] text-zinc-400 mt-6">No backend needed — real login will be added later</p>
    </div>
  )
}

export default Login
