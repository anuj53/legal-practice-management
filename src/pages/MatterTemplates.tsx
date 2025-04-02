
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MatterTemplates() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to the Matter page with templates tab
    navigate('/matter', { state: { activeTab: 'templates' } });
  }, [navigate]);

  return null; // This component will redirect, so no need to render anything
}
