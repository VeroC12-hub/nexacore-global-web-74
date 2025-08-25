// src/pages/AuthConfirm.tsx
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AuthConfirm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      const token_hash = searchParams.get('token_hash');
      const type = searchParams.get('type');
      
      if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type: 'email' as any,
        });

        if (error) {
          toast.error('Email confirmation failed or expired');
          navigate('/auth?message=confirmation_failed');
        } else {
          toast.success('Email confirmed successfully! You are now signed in.');
          navigate('/dashboard');
        }
      } else {
        toast.error('Invalid confirmation link');
        navigate('/auth');
      }
    };

    handleEmailConfirmation();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Confirming your email...</p>
      </div>
    </div>
  );
};

export default AuthConfirm;
