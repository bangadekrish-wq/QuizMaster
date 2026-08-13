import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { GraduationCap, Lock, CheckCircle2 } from 'lucide-react';

export const ResetPassword = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      await authService.resetPassword('demo-token', data.password);
      setSubmitted(true);
      addToast('Password reset successfully! You can now log in.', 'success');
    } catch (err) {
      addToast('Failed to reset password.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-dark-elevated border border-dark-borderLight rounded-ms-xl shadow-2xl p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="p-3 rounded-ms-lg bg-brand-cyan/15 border border-brand-cyan/30 text-brand-cyan shadow-ms-glow mb-3">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">New Password</h1>
          <p className="text-xs text-slate-400 mt-1">Set a strong new password for your account</p>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center text-center p-4 bg-brand-green/10 border border-brand-green/30 rounded-ms">
            <CheckCircle2 className="w-10 h-10 text-brand-green mb-2" />
            <p className="text-sm font-bold text-brand-greenLight">Password Updated!</p>
            <Button variant="primary" className="mt-4" onClick={() => navigate('/login')}>
              Proceed to Sign In
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="New Password"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              {...register('password', { required: 'New password is required', minLength: 6 })}
              error={errors.password?.message}
            />
            <Input
              label="Confirm New Password"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              {...register('confirmPassword', {
                required: 'Please confirm password',
                validate: (val) => val === password || 'Passwords do not match',
              })}
              error={errors.confirmPassword?.message}
            />
            <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting}>
              Update Password
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
