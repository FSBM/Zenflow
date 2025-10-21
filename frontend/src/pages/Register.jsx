import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api';
import { isValidEmail } from '../utils/helpers';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({});

    try {
      const response = await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      login(response.user, response.token);
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({
        submit: error.response?.data?.message || 'Registration failed. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card className="animate-fade-in">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-light">Create Account</CardTitle>
            <CardDescription>Join us to manage your projects</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.submit && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                  <p className="text-destructive text-sm">{errors.submit}</p>
                </div>
              )}

              <div className="space-y-4">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={errors.name ? 'border-destructive' : ''}
                    placeholder="Enter your full name"
                  />
                  {errors.name && (
                    <p className="text-destructive text-sm">{errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? 'border-destructive' : ''}
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="text-destructive text-sm">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? 'border-destructive' : ''}
                    placeholder="Create a password"
                  />
                  {errors.password && (
                    <p className="text-destructive text-sm">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={errors.confirmPassword ? 'border-destructive' : ''}
                    placeholder="Confirm your password"
                  />
                  {errors.confirmPassword && (
                    <p className="text-destructive text-sm">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>

              {/* Login Link */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary hover:underline font-medium">
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
