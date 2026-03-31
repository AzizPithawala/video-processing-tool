import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'editor',
    tenantName: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      // error is set in context
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">🎬</div>
          <h2>Create Account</h2>
          <p>Join VideoVault to start processing videos</p>
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="register-name" className="form-label">Full Name</label>
            <input
              id="register-name"
              name="name"
              type="text"
              className="form-input"
              placeholder="John Doe"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-email" className="form-label">Email</label>
            <input
              id="register-email"
              name="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-password" className="form-label">Password</label>
            <input
              id="register-password"
              name="password"
              type="password"
              className="form-input"
              placeholder="Minimum 6 characters"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-role" className="form-label">Role</label>
            <select
              id="register-role"
              name="role"
              className="form-input"
              value={form.role}
              onChange={handleChange}
            >
              <option value="viewer">Viewer — View assigned videos</option>
              <option value="editor">Editor — Upload & manage videos</option>
              <option value="admin">Admin — Full system access</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="register-tenant" className="form-label">Organization Name (optional)</label>
            <input
              id="register-tenant"
              name="tenantName"
              type="text"
              className="form-input"
              placeholder="Your company or team name"
              value={form.tenantName}
              onChange={handleChange}
            />
          </div>

          <button
            id="register-submit-btn"
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? (
              <><span className="loading-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Creating account...</>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
