import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { GraduationCap, Lock, Mail, User, UserPlus } from 'lucide-react';

export const StudentRegister = () => {
  const { register: registerUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setServerError('');
    try {
      await registerUser({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      });
      addToast('Student account created successfully! Welcome to QuizMaster.', 'success');
      navigate('/student/dashboard');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 right-1/2 translate-x-1/2 w-96 h-96 bg-brand-cyan/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-dark-elevated border border-dark-borderLight rounded-ms-xl shadow-2xl p-8 relative z-10">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="p-3 rounded-ms-lg bg-brand-cyan/15 border border-brand-cyan/30 text-brand-cyan shadow-ms-glow mb-3">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            Quiz<span className="text-brand-cyan">Master</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Student Account Registration</p>
        </div>

        {serverError && (
          <div className="p-3 mb-6 bg-brand-red/10 border border-brand-red/30 rounded-ms text-xs text-brand-redLight text-center font-medium">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            icon={User}
            placeholder="Krish Sharma"
            {...register('fullName', { required: 'Full Name is required' })}
            error={errors.fullName?.message}
          />

          <Input
            label="Email Address"
            type="email"
            icon={Mail}
            placeholder="krish@example.com"
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
            placeholder="Min 6 characters"
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Password must be at least 6 characters' },
            })}
            error={errors.password?.message}
          />

          <Input
            label="Confirm Password"
            type="password"
            icon={Lock}
            placeholder="Re-enter password"
            {...register('confirmPassword', {
              required: 'Please confirm password',
              validate: (val) => val === password || 'Passwords do not match',
            })}
            error={errors.confirmPassword?.message}
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2"
            size="lg"
            isLoading={isSubmitting}
            icon={UserPlus}
          >
            Create Student Account
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-dark-border flex flex-col items-center gap-2 text-xs text-slate-400">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="text-brand-cyan font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
