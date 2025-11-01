// Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    fetchCurrentUser();
    fetchUsers();
  }, []);

  async function fetchCurrentUser() {
    try {
      const res = await fetch("http://localhost:3002/me", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        if (res.status === 401) {
          logout();
        }
        throw new Error("Failed to load current user");
      }
      const data = await res.json();
      setCurrentUser(data.user);
    } catch (err) {
      console.error(err);
      setError("Could not load current user");
    }
  }

  async function fetchUsers() {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:3002/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        if (res.status === 401) return logout();
        throw new Error("Failed to load users");
      }
      const data = await res.json();
      setUsers(data.users);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Could not load users");
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    navigate("/");
  }

  function startEdit(user) {
    setEditingId(user._id);
    setEditForm({ name: user.name, email: user.email });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({ name: "", email: "" });
  }

  async function saveEdit(id) {
    try {
      if (!editForm.name || !editForm.email) {
        setError("Name and email cannot be empty");
        return;
      }
      const res = await fetch(`http://localhost:3002/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editForm.name, email: editForm.email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Update failed");
        return;
      }

      setUsers((prev) => prev.map((u) => (u._id === id ? data.user : u)));
      cancelEdit();
    } catch (err) {
      console.error(err);
      setError("Update failed");
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );
    if (!confirmed) return;
    try {
      const res = await fetch(`http://localhost:3002/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Delete failed");
        return;
      }
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.error(err);
      setError("Delete failed");
    }
  }

  return (
    <div className="container py-4">
      <nav className="d-flex justify-content-between align-items-center mb-4">
        <h4>Dashboard</h4>
        <div>
          {currentUser && (
            <span className="me-3">Welcome, {currentUser.name} </span>
          )}
          <button className="btn btn-outline-secondary" onClick={logout}>
            Logout
          </button>
        </div>
      </nav>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card p-3">
        <h5>All Users</h5>
        {loading ? (
          <p>Loading users...</p>
        ) : (
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th style={{ width: 220 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>
                    {editingId === user._id ? (
                      <input
                        className="form-control"
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                      />
                    ) : (
                      user.name
                    )}
                  </td>
                  <td>
                    {editingId === user._id ? (
                      <input
                        className="form-control"
                        value={editForm.email}
                        onChange={(e) =>
                          setEditForm({ ...editForm, email: e.target.value })
                        }
                      />
                    ) : (
                      user.email
                    )}
                  </td>
                  <td>
                    {editingId === user._id ? (
                      <>
                        <button
                          className="btn btn-sm btn-success me-2"
                          onClick={() => saveEdit(user._id)}
                        >
                          Save
                        </button>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={cancelEdit}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn btn-sm btn-primary me-2"
                          onClick={() => startEdit(user)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(user._id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
