export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    // Delay to ensure user is engaged first
    await new Promise(resolve => setTimeout(resolve, 2000));
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const showNotification = (title: string, options?: NotificationOptions) => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      ...options,
    });
  }
};

export const setupMessageNotifications = (userId: string, supabase: any) => {
  // Request permission first
  requestNotificationPermission();

  // Set up real-time subscription for new messages
  const channel = supabase
    .channel('message-notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=in.(select conversation_id from conversation_participants where user_id=eq.${userId})`
      },
      async (payload: any) => {
        const newMessage = payload.new;
        
        // Don't notify for own messages
        if (newMessage.sender_id === userId) return;

        // Get sender info
        const { data: senderProfile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('user_id', newMessage.sender_id)
          .single();

        const senderName = senderProfile?.display_name || 'Someone';
        
        showNotification(`New message from ${senderName}`, {
          body: newMessage.content.substring(0, 100),
          tag: `message-${newMessage.id}`,
          requireInteraction: false,
        });
      }
    )
    .subscribe();

  return channel;
};

export const setupContactRequestNotifications = (userId: string, supabase: any) => {
  // Request permission first
  requestNotificationPermission();

  // Set up real-time subscription for contact requests
  const channel = supabase
    .channel('contact-request-notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      },
      async (payload: any) => {
        const notification = payload.new;
        
        // Show browser notification
        showNotification(notification.title, {
          body: notification.message,
          tag: `notification-${notification.id}`,
          requireInteraction: false,
        });
      }
    )
    .subscribe();

  return channel;
};
