// src/pages/AuthConfirm.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AuthConfirm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');
        const access_token = searchParams.get('access_token');
        const refresh_token = searchParams.get('refresh_token');

        console.log('🔍 Confirmation parameters:', {
          token_hash: token_hash ? 'present' : 'missing',
          type,
          access_token: access_token ? 'present' : 'missing',
          refresh_token: refresh_token ? 'present' : 'missing'
        });

        // Handle token-based confirmation (newer method)
        if (token_hash && type) {
          console.log('📧 Processing token-based confirmation...');
          
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as any,
          });

          if (error) {
            console.error('❌ Token verification failed:', error);
            if (error.message.includes('expired') || error.message.includes('invalid')) {
              setStatus('expired');
              setMessage('Your confirmation link has expired or is invalid. Please request a new one.');
            } else {
              setStatus('error');
              setMessage(`Confirmation failed: ${error.message}`);
            }
          } else {
            console.log('✅ Token confirmation successful:', data);
            setStatus('success');
            setMessage('Email confirmed successfully! You are now signed in.');
            toast.success('Welcome! Your email has been confirmed.');
            
            // Redirect to dashboard after short delay
            setTimeout(() => {
              navigate('/dashboard');
            }, 2000);
          }
        }
        // Handle session-based confirmation (older method)
        else if (access_token && refresh_token) {
          console.log('🔑 Processing session-based confirmation...');
          
          const { data, error } = await supabase.auth.setSession({
            access_token,
            refresh_token
          });

          if (error) {
            console.error('❌ Session confirmation failed:', error);
            setStatus('error');
            setMessage(`Session setup failed: ${error.message}`);
          } else {
            console.log('✅ Session confirmation successful:', data);
            setStatus('success');
            setMessage('Email confirmed successfully! You are now signed in.');
            toast.success('Welcome! Your email has been confirmed.');
            
            // Redirect to dashboard after short delay
            setTimeout(() => {
              navigate('/dashboard');
            }, 2000);
          }
        }
        // No valid parameters found
        else {
          console.error('❌ No valid confirmation parameters found');
          setStatus('error');
          setMessage('Invalid confirmation link. Please check your email for the correct link.');
        }
      } catch (error) {
        console.error('❌ Unexpected error during confirmation:', error);
        setStatus('error');
        setMessage(`An unexpected error occurred: ${error.message}`);
      }
    };

    handleEmailConfirmation();
  }, [searchParams, navigate]);

  const handleRetry = () => {
    navigate('/auth?message=resend_needed');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <>
            <RefreshCw className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold mb-2">Confirming Your Email</h2>
            <p className="text-gray-600">Please wait while we verify your email address...</p>
          </>
        );

      case 'success':
        return (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-800 mb-2">Email Confirmed!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <p className="text-sm text-gray-500">Redirecting you to your dashboard...</p>
          </>
        );

      case 'expired':
        return (
          <>
            <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-orange-800 mb-2">Link Expired</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex gap-3">
              <Button onClick={handleRetry} className="flex-1">
                Request New Link
              </Button>
              <Button onClick={handleGoHome} variant="outline" className="flex-1">
                Go Home
              </Button>
            </div>
          </>
        );

      case 'error':
        return (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-800 mb-2">Confirmation Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex gap-3">
              <Button onClick={handleRetry} className="flex-1">
                Try Again
              </Button>
              <Button onClick={handleGoHome} variant="outline" className="flex-1">
                Go Home
              </Button>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-teal-50">
      <Navbar />
      
      <section className="pt-24 pb-16">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-8 text-center">
            {renderContent()}
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AuthConfirm;
