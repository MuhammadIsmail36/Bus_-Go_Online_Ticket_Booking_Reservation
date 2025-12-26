import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import Layout from '@/components/Layout';

/**
 * Register Page - Modern Transit Minimalism Design
 * User registration form with validation
 */

export default function Register() {
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
    // Clear any autofill and ensure empty state on mount
    useEffect(() => {
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
      });
    }, []);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    } else if (formData.phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'Phone number must be at least 10 digits.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setShowSuccess(true);
      setIsSubmitting(false);
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }, 1000);
  };

  if (showSuccess) {
    return (
      <Layout>
        <section className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 bg-background">
          <div className="w-full max-w-md">
            <div className="bg-card rounded-lg shadow-lg p-8 border border-border text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-check text-green-600 text-3xl"></i>
              </div>
              <h2 className="text-2xl font-bold text-primary mb-2">Account Created!</h2>
              <p className="text-muted-foreground mb-6">
                Your account has been created successfully. Redirecting to login...
              </p>
              <div className="animate-spin inline-block">
                <i className="fas fa-spinner text-accent text-2xl"></i>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 bg-background">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-lg shadow-lg p-8 border border-border">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-bus text-white text-2xl"></i>
              </div>
              <h1 className="text-3xl font-bold text-primary mb-2">Create Account</h1>
              <p className="text-muted-foreground">Join BusGo today</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-semibold text-foreground mb-2">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  autoComplete="off"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-foreground mb-2">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-foreground mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-foreground mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Create Account Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-accent flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <i className="fas fa-user-plus"></i>
                    Create Account
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">Already have an account?</span>
              </div>
            </div>

            {/* Login Link */}
            <a
              href="/login"
              className="w-full block text-center py-3 px-4 border border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-all duration-200"
            >
              Sign In
            </a>
          </div>

          {/* Additional Info */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            By creating an account, you agree to our{' '}
            <a href="#terms" className="text-primary hover:underline">
              Terms & Conditions
            </a>{' '}
            and{' '}
            <a href="#privacy" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </section>
    </Layout>
  );
}
