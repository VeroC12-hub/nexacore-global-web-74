import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const EnhancedHeroButtons = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Button
        size="lg"
        onClick={() => navigate('/get-started')}
        className="bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        Get Started
      </Button>
      <Button
        variant="outline"
        size="lg"
        onClick={() => navigate('/contact')}
        className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
      >
        Contact Us
      </Button>
    </div>
  );
};

export default EnhancedHeroButtons;