// src/pages/Auth.tsx - FIXED VERSION with better routing logic

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  // 🚀 IMPROVED: Smart dashboard redirect based on user role
  const getSmartDashboardRedirect = (userRole: string | undefined, email: string): string => {
    console.log('🧭 Smart dashboard redirect for:', { userRole, email });
    
    // Admin-level roles that should go to admin dashboard
    const adminRoles = ['admin', 'project_manager', 'operations_manager', 'staff'];
    
    // Special case: admin email always goes to admin dashboard
    if (email === 'admin@nexacore-innovations.com' || email.includes('admin')) {
      console.log('🔑 Admin email detected, redirecting to admin dashboard');
      return '/admin';
    }
    
    // Check if user has admin-level role
    if (userRole && adminRoles.includes(userRole)) {
      console.log('✅ Admin role detected:', userRole);
      return '/admin';
    }
    
    // Check for other specific roles
    switch (userRole) {
      case 'business_analyst':
      case 'quality_assurance':
      case 'sales_manager':
        console.log('🎯 Management role detected:', userRole);
        return '/admin'; // These roles also get admin access
      
      case 'member':
        console.log('👤 Member role detected');
        return '/client-portal';
      
      default:
        console.log('❓ Unknown or no role, defaulting to client portal');
        return '/client-portal';
    }
  };

  // 🚀 IMPROVED: Effect with better role checking
  React.useEffect(() => {
    const routeAfterLogin = async () => {
      if (user) {
        try {
          console.log('🔍 Checking user profile for:', user.email);
          
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('role, status, full_name')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('❌ Profile fetch error:', error);
            // Fallback: check by email if profile lookup fails
            const dashboardUrl = getSmartDashboardRedirect(undefined, user.email || '');
            navigate(dashboardUrl);
            return;
          }

          console.log('📋 User profile:', profile);
          
          // Check if user is approved
          if (profile?.status === 'pending') {
            setError('Your account is pending approval. Please contact support.');
            return;
          }
          
          if (profile?.status === 'suspended' || profile?.status === 'inactive') {
            setError('Your account has been suspended. Please contact support.');
            return;
          }

          // Smart redirect based on role and email
          const dashboardUrl = getSmartDashboardRedirect(profile?.role, user.email || '');
          console.log('🎯 Redirecting to:', dashboardUrl);
          navigate(dashboardUrl);

        } catch (err) {
          console.error('❌ Route after login error:', err);
          // Fallback redirect
          const dashboardUrl = getSmartDashboardRedirect(undefined, user.email || '');
          navigate(dashboardUrl);
        }
      }
    };
    
    routeAfterLogin();
  }, [user, navigate]);

  // 🚀 IMPROVED: Sign in with better role checking
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        setError(error.message);
        return;
      }

      console.log('✅ Sign in successful for:', email);

      // Check user role and redirect accordingly
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, status, full_name')
        .eq('email', email)
        .single();

      if (profileError) {
        console.error('❌ Profile lookup error:', profileError);
        // Fallback: use email-based redirect
        const dashboardUrl = getSmartDashboardRedirect(undefined, email);
        navigate(dashboardUrl);
        return;
      }

      console.log('📋 Profile found:', profile);

      // Check account status
      if (profile?.status === 'pending') {
        setError('Your account is pending approval. Please contact support.');
        return;
      }
      
      if (profile?.status === 'suspended' || profile?.status === 'inactive') {
        setError('Your account has been suspended. Please contact support.');
        return;
      }

      // Smart redirect
      const dashboardUrl = getSmartDashboardRedirect(profile?.role, email);
      console.log('🎯 Redirecting to:', dashboardUrl);
      navigate(dashboardUrl);

    } catch (err) {
      console.error('❌ Sign in error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const { error } = await signUp(email, password, fullName);
      
      if (error) {
        setError(error.message);
      } else {
        setMessage('Check your email for a verification link!');
      }
    } catch (err) {
      console.error('❌ Sign up error:', err);
      setError('An unexpected error occurred during sign up.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="text-center">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center text-gray-400 hover:text-white mb-4 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </button>
              <CardTitle className="text-2xl font-bold text-white">Welcome to NexaCore</CardTitle>
              <CardDescription className="text-gray-300">
                Sign in to access your dashboard
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-white/5">
                  <TabsTrigger value="signin" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
                    Sign Up
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin" className="space-y-4">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-300">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="admin@nexacore-innovations.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-gray-300">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    
                    {error && (
                      <Alert className="bg-red-500/20 border-red-500/50">
                        <AlertDescription className="text-red-200">
                          {error}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-yellow-400 text-black hover:bg-yellow-500 font-semibold"
                    >
                      {loading ? 'Signing In...' : 'Sign In'}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup" className="space-y-4">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-gray-300">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="fullName"
                          type="text"
                          placeholder="Your full name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-gray-300">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="your.email@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-gray-300">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    
                    {error && (
                      <Alert className="bg-red-500/20 border-red-500/50">
                        <AlertDescription className="text-red-200">
                          {error}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {message && (
                      <Alert className="bg-green-500/20 border-green-500/50">
                        <AlertDescription className="text-green-200">
                          {message}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-yellow-400 text-black hover:bg-yellow-500 font-semibold"
                    >
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AuthPage;
