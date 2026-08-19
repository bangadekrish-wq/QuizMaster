import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { GraduationCap, Lock, Mail, LogIn, ShieldCheck, UserCheck } from 'lucide-react';
import { getApiErrorMessage } from '../../utils/apiError';

export const Login = () => {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const user = await login({
        email: data.email,
        password: data.password,
        isAdmin: isAdminLogin,
      });

      addToast(`Welcome back, ${user.name}!`, 'success');

      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setServerError(getApiErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-dark-elevated border border-dark-borderLight rounded-ms-xl shadow-2xl p-8 relative z-10">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="p-3 rounded-ms-lg bg-brand-cyan/15 border border-brand-cyan/30 text-brand-cyan shadow-ms-glow mb-3">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            Quiz<span className="text-brand-cyan">Master</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isAdminLogin ? 'Administrator Sign In Portal' : 'Student & Assessor Portal'}
          </p>
        </div>

        {/* Tab Switcher for Admin vs Student Portal */}
        <div className="flex bg-dark-card border border-dark-border rounded-ms p-1 mb-6">
          <button
            type="button"
            onClick={() => setIsAdminLogin(false)}
            className={`flex-1 py-2 text-xs font-bold rounded-ms flex items-center justify-center gap-2 transition-all ${
              !isAdminLogin
                ? 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Student Login
          </button>
          <button
            type="button"
            onClick={() => setIsAdminLogin(true)}
            className={`flex-1 py-2 text-xs font-bold rounded-ms flex items-center justify-center gap-2 transition-all ${
              isAdminLogin
                ? 'bg-brand-purple/20 text-brand-purpleLight border border-brand-purple/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin Login
          </button>
        </div>

        {serverError && (
          <div className="p-3 mb-6 bg-brand-red/10 border border-brand-red/30 rounded-ms text-xs text-brand-redLight text-center font-medium">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            icon={Mail}
            placeholder={isAdminLogin ? 'admin@quizmaster.io' : 'student@example.com'}
            {...register('email', {
              required: 'Email address is required',
              pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email address' },
            })}
            error={errors.email?.message}
          />

          <Input
            label="Password"
            type="password"
            icon={Lock}
            placeholder="••••••••"
            {...register('password', { required: 'Password is required' })}
            error={errors.password?.message}
          />

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
              <input type="checkbox" className="rounded bg-dark-card border-dark-border text-brand-cyan focus:ring-0" />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-brand-cyan hover:underline font-medium">
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            variant={isAdminLogin ? 'purple' : 'primary'}
            className="w-full mt-2"
            size="lg"
            isLoading={isSubmitting}
            disabled={isSubmitting}
            icon={LogIn}
          >
            {isSubmitting ? 'Connecting to server...' : `Sign In as ${isAdminLogin ? 'Administrator' : 'Student'}`}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-dark-border flex flex-col items-center gap-2 text-xs text-slate-400">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-cyan font-bold hover:underline">
              Create Student Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
