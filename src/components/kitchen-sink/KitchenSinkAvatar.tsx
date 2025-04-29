import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function KitchenSinkAvatar() {
  return (
    <div className="flex gap-4">
      <Avatar>
        <AvatarImage src="/images/avatar.png" alt="Avatar" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>BM</AvatarFallback>
      </Avatar>
    </div>
  );
} 