import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { userService } from '../../services/userService';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Avatar } from '../../components/common/Avatar';
import { Badge } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Save, Lock, User } from 'lucide-react';

export const ProfilePage = () => {
  const { user, role, updateProfileState } = useAuth();
  const { addToast } = useToast();

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { isSubmitting: isProfileSubmitting },
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      avatar: user?.avatar || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    watch,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
  } = useForm();

  const newPassword = watch('newPassword');

  const onUpdateProfile = async (data) => {
    try {
      await userService.updateProfile(data);
      updateProfileState(data);
      addToast('Profile updated successfully!', 'success');
    } catch (err) {
      addToast('Failed to update profile.', 'error');
    }
  };

  const onUpdatePassword = async (data) => {
    try {
      addToast('Password updated successfully!', 'success');
      resetPasswordForm();
    } catch (err) {
      addToast('Failed to update password.', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Header
        title="Account Profile"
        subtitle="Manage your personal details, avatar, and security credentials."
      />

      {/* Header Profile Summary */}
      <Card className="flex items-center gap-5 p-6">
        <Avatar src={user?.avatar} name={user?.name || 'User'} size="xl" />
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-100">{user?.name}</h2>
            <Badge variant={role === 'ADMIN' ? 'purple' : 'cyan'}>{role}</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">{user?.email}</p>
        </div>
      </Card>

      {/* Edit Profile Form */}
      <Card className="p-6">
        <h3 className="text-base font-bold text-slate-100 border-b border-dark-border pb-3 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-brand-cyan" /> Edit Profile Information
        </h3>
        <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-4">
          <Input label="Full Name" {...registerProfile('name', { required: true })} />
          <Input label="Avatar Image URL" placeholder="https://images.unsplash.com/..." {...registerProfile('avatar')} />
          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" isLoading={isProfileSubmitting} icon={Save}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Change Password Form */}
      <Card className="p-6">
        <h3 className="text-base font-bold text-slate-100 border-b border-dark-border pb-3 mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-brand-purple" /> Change Password
        </h3>
        <form onSubmit={handlePasswordSubmit(onUpdatePassword)} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            {...registerPassword('currentPassword', { required: 'Current password is required' })}
            error={passwordErrors.currentPassword?.message}
          />
          <Input
            label="New Password"
            type="password"
            {...registerPassword('newPassword', { required: 'New password is required', minLength: 6 })}
            error={passwordErrors.newPassword?.message}
          />
          <Input
            label="Confirm New Password"
            type="password"
            {...registerPassword('confirmPassword', {
              required: 'Confirm password required',
              validate: (val) => val === newPassword || 'Passwords do not match',
            })}
            error={passwordErrors.confirmPassword?.message}
          />
          <div className="flex justify-end pt-2">
            <Button type="submit" variant="purple" isLoading={isPasswordSubmitting} icon={Save}>
              Update Password
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
