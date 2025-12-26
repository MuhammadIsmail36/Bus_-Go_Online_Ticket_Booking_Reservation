import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import Layout from '@/components/Layout';

/**
 * Login Page - Modern Transit Minimalism Design
 * Email/Phone and password authentication form
 */

export default function Login() {
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: '',
    rememberMe: false,
  });
    // Clear any autofill and ensure empty state on mount
    useEffect(() => {
      setFormData({ emailOrPhone: '', password: '', rememberMe: false });
    }, []);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.emailOrPhone.trim()) {
      newErrors.emailOrPhone = 'Please enter your email or phone.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
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
      // Store login state in localStorage
      localStorage.setItem(
        'user',
        JSON.stringify({
          emailOrPhone: formData.emailOrPhone,
          name: formData.emailOrPhone.split('@')[0],
        })
      );
      setIsSubmitting(false);
      navigate('/');
    }, 1000);
  };

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
              <h1 className="text-3xl font-bold text-primary mb-2">Welcome Back</h1>
              <p className="text-muted-foreground">Sign in to your BusGo account</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
              {/* Email/Phone Input */}
              <div>
                <label htmlFor="emailOrPhone" className="block text-sm font-semibold text-foreground mb-2">
                  Email or Phone Number
                </label>
                <input
                  id="emailOrPhone"
                  type="text"
                  name="emailOrPhone"
                  value={formData.emailOrPhone}
                  onChange={handleInputChange}
                  placeholder="Enter your email or phone"
                  autoComplete="off"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                {errors.emailOrPhone && (
                  <p className="text-red-500 text-sm mt-1">{errors.emailOrPhone}</p>
                )}
              </div>

              {/* Password Input */}
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
                  placeholder="Enter your password"
                  autoComplete="new-password"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded border-border cursor-pointer"
                  />
                  <span className="text-sm text-muted-foreground">Remember me</span>
                </label>
                <a href="#forgot" className="text-sm text-primary hover:underline">
                  Forgot password?
                </a>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-accent flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Signing in...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt"></i>
                    Login
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
                <span className="px-2 bg-card text-muted-foreground">Don't have an account?</span>
              </div>
            </div>

            {/* Create Account Link */}
            <a
              href="/register"
              className="w-full block text-center py-3 px-4 border border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-all duration-200"
            >
              Create Account
            </a>
          </div>

          {/* Additional Info */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            By logging in, you agree to our{' '}
            <a href="#terms" className="text-primary hover:underline">
              Terms & Conditions
            </a>
          </p>
        </div>
      </section>
    </Layout>
  );
}
