import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { GraduationCap, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { getApiErrorMessage } from '../../utils/apiError';

export const ForgotPassword = () => {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    setServerError('');
    try {
      await authService.forgotPassword(data.email);
      setSubmitted(true);
    } catch (err) {
      setServerError(getApiErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-slate-100 flex items-center justify-center p-4 relative">
      <div className="w-full max-w-md bg-dark-elevated border border-dark-borderLight rounded-ms-xl shadow-2xl p-8 relative z-10">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="p-3 rounded-ms-lg bg-brand-cyan/15 border border-brand-cyan/30 text-brand-cyan shadow-ms-glow mb-3">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Reset Password</h1>
          <p className="text-xs text-slate-400 mt-1">
            Enter your registered email to receive password recovery instructions
          </p>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center text-center p-4 bg-brand-green/10 border border-brand-green/30 rounded-ms">
            <CheckCircle2 className="w-10 h-10 text-brand-green mb-2" />
            <p className="text-sm font-bold text-brand-greenLight">Reset Link Sent!</p>
            <p className="text-xs text-slate-300 mt-1">
              Please check your email inbox for instructions to reset your password.
            </p>
            <Link to="/login" className="mt-4">
              <Button variant="outline" size="sm">
                Return to Login
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {serverError && (
              <div className="p-3 bg-brand-red/10 border border-brand-red/30 rounded-ms text-xs text-brand-redLight text-center font-medium">
                {serverError}
              </div>
            )}
            <Input
              label="Email Address"
              type="email"
              icon={Mail}
              placeholder="you@example.com"
              {...register('email', { required: 'Email address is required' })}
              error={errors.email?.message}
            />
            <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting} disabled={isSubmitting}>
              {isSubmitting ? 'Connecting to server...' : 'Send Recovery Link'}
            </Button>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-dark-border flex justify-center text-xs text-slate-400">
          <Link to="/login" className="inline-flex items-center gap-1 hover:text-brand-cyan transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
