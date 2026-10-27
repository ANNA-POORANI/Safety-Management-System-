import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FlaskConical, ShieldAlert, Lock, Mail, User, Phone, CheckCircle2, ArrowRight } from 'lucide-react';

export const Login = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Plant Operator');
  const [shift, setShift] = useState('Morning Shift (A)');
  const [department, setDepartment] = useState('Chemical Operations');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        const result = await register({
          name,
          email,
          password,
          role,
          shift,
          department
        });
        if (result.success) {
          navigate('/');
        } else {
          setError(result.message);
        }
      } else {
        const result = await login(email, password);
        if (result.success) {
          navigate('/');
        } else {
          setError(result.message);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail, demoPassword) => {
    setError('');
    setLoading(true);
    setEmail(demoEmail);
    setPassword(demoPassword);
    const result = await login(demoEmail, demoPassword);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background radial effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 shadow-xl shadow-amber-500/20 mb-4">
            <FlaskConical className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-wide">
            Chemical Plant Safety
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Enterprise Process Safety Management & Incident Prevention
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
          {/* Tab buttons */}
          <div className="flex rounded-xl bg-slate-950/70 p-1 mb-6 border border-slate-800/80">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(false);
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                !isRegistering
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegistering(true);
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                isRegistering
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Register Operator
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Marcus Vance"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Role
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="Safety Manager">Safety Manager</option>
                      <option value="Plant Operator">Plant Operator</option>
                      <option value="Compliance Officer">Compliance Officer</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Shift
                    </label>
                    <select
                      value={shift}
                      onChange={(e) => setShift(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="Morning Shift (A)">Shift A (Morning)</option>
                      <option value="Evening Shift (B)">Shift B (Evening)</option>
                      <option value="Night Shift (C)">Shift C (Night)</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Plant Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@plant.safe"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isRegistering ? 'Register Plant Account' : 'Access Safety Control'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 text-center">
              One-Click Demo Roles (Pre-loaded):
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('manager@plant.safe', 'password123')}
                className="w-full p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 text-left flex items-center justify-between text-xs transition-all group"
              >
                <div>
                  <p className="font-bold text-amber-300 group-hover:text-amber-200">
                    Dr. Marcus Vance (Safety Manager)
                  </p>
                  <p className="text-[10px] text-slate-400">manager@plant.safe / password123</p>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  Select &rarr;
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('operator@plant.safe', 'password123')}
                className="w-full p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 text-left flex items-center justify-between text-xs transition-all group"
              >
                <div>
                  <p className="font-bold text-cyan-300 group-hover:text-cyan-200">
                    Elena Rostova (Plant Operator)
                  </p>
                  <p className="text-[10px] text-slate-400">operator@plant.safe / password123</p>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  Select &rarr;
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('compliance@plant.safe', 'password123')}
                className="w-full p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 text-left flex items-center justify-between text-xs transition-all group"
              >
                <div>
                  <p className="font-bold text-emerald-300 group-hover:text-emerald-200">
                    Sarah Chen (Compliance Officer)
                  </p>
                  <p className="text-[10px] text-slate-400">compliance@plant.safe / password123</p>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  Select &rarr;
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-6 text-xs text-slate-500">
          OSHA 29 CFR 1910.119 &bull; EPA Risk Management Plan (RMP) Compliant
        </div>
      </div>
    </div>
  );
};
