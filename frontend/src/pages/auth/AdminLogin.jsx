import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ShieldCheck, Lock, Mail, ArrowRight } from 'lucide-react';
import { getApiErrorMessage } from '../../utils/apiError';

export const AdminLogin = () => {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: 'admin@quizmaster.io',
      password: 'adminpassword',
    },
  });

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const user = await login({ email: data.email, password: data.password, isAdmin: true });
      addToast(`Administrator session initialized for ${user.name}`, 'success');
      navigate('/admin/dashboard');
    } catch (err) {
      setServerError(getApiErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-purple/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-dark-elevated border border-brand-purple/30 rounded-ms-xl shadow-2xl p-8 relative z-10">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="p-3.5 rounded-ms-lg bg-brand-purple/20 border border-brand-purple/40 text-brand-purpleLight shadow-ms-glow-purple mb-3">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <Badge variant="purple" size="sm" className="mb-2">
            ADMINISTRATOR PORTAL
          </Badge>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            Quiz<span className="text-brand-purpleLight">Master</span> Admin
          </h1>
          <p className="text-xs text-slate-400 mt-1">Management & Analytics Access</p>
        </div>

        {serverError && (
          <div className="p-3 mb-6 bg-brand-red/10 border border-brand-red/30 rounded-ms text-xs text-brand-redLight text-center font-medium">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Admin Email"
            type="email"
            icon={Mail}
            placeholder="admin@quizmaster.io"
            {...register('email', { required: 'Admin email is required' })}
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

          <Button
            type="submit"
            variant="purple"
            className="w-full mt-2"
            size="lg"
            isLoading={isSubmitting}
            disabled={isSubmitting}
            icon={ArrowRight}
            iconPosition="right"
          >
            {isSubmitting ? 'Connecting to server...' : 'Authenticate Admin'}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-dark-border flex justify-center text-xs text-slate-400">
          <Link to="/login" className="text-slate-400 hover:text-brand-cyan transition-colors">
            ← Switch to Student Login
          </Link>
        </div>
      </div>
    </div>
  );
};
