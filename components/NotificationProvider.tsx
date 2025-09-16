import React, { useEffect, useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user, token } = useAuth();
  const { registerForPushNotifications, isLoading, error, isRegistered } = useNotifications();
  const [retryCount, setRetryCount] = useState(0);
  const [lastAttempt, setLastAttempt] = useState<number>(0);

  const MAX_RETRIES = 3;
  const RETRY_DELAY = 5000; // 5 seconds

  useEffect(() => {
    // Register for push notifications when user is authenticated
    if (user && token && !isLoading && !isRegistered) {
      const now = Date.now();
      
      // Prevent too frequent retries
      if (now - lastAttempt < RETRY_DELAY) {
        return;
      }

      setLastAttempt(now);
      
      registerForPushNotifications(token)
        .then((pushToken) => {
          if (pushToken) {
            console.log('Successfully registered push token with backend');
            setRetryCount(0); // Reset retry count on success
          } else {
            throw new Error('No push token received');
          }
        })
        .catch((error) => {
          console.error('Failed to register for push notifications:', error);
          
          // Retry logic
          if (retryCount < MAX_RETRIES) {
            console.log(`Retrying push notification registration (${retryCount + 1}/${MAX_RETRIES})`);
            setRetryCount(prev => prev + 1);
            
            // Retry after delay
            setTimeout(() => {
              setLastAttempt(0); // Reset last attempt to allow retry
            }, RETRY_DELAY);
          } else {
            console.error('Max retries reached for push notification registration');
          }
        });
    }
  }, [user, token, isLoading, isRegistered, retryCount, lastAttempt, registerForPushNotifications]);

  // Log any notification errors
  useEffect(() => {
    if (error) {
      console.error('Notification error:', error);
    }
  }, [error]);

  return <>{children}</>;
};
