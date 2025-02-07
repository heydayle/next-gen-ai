'use client';

import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Plus } from 'lucide-react';
import { useParams } from 'next/navigation';

import { Button } from './ui/button';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import useChat, { Chat } from '@/hooks/use-chat';
import { useIndexedDB } from '@/hooks/use-db';

export function AppSidebar() {
  const [sessionList, setSessionList] = useState<Chat[]>([]);
  const { slug } = useParams<{ slug: string }>();

  const isCurrentlyActive = (sessionId: string) => {
    return slug === sessionId;
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    if (dayjs(d).isSame(dayjs(), 'day')) {
      return 'Today' + dayjs(d).format(', hh:mm A');
    }
    return dayjs(d).format('hh:mm MMM DD, YYYY');
  };

  const {
    getAll,
    error: dbError,
    db,
  } = useIndexedDB<Chat>({
    dbName: 'devAIoka',
    storeName: 'Chat_sessions',
  });

  const [isDbReady, setIsDbReady] = useState(false);
  const { onNewChat } = useChat({ sessionId: '' });

  const initMessageHistory = async () => {
    if (!isDbReady || dbError) return;

    try {
      console.log('Getting all chat sessions');

      const chatSessions = await getAll();
      setSessionList(chatSessions);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (db && !dbError) {
      setIsDbReady(true);
    }
  }, [db, dbError]);
  useEffect(() => {
    initMessageHistory().then();
  }, [isDbReady]);

  const createNewChat = () => {
    onNewChat();
    initMessageHistory().then();
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="mb-4 flex justify-between">
            <span>Threads</span>
            <Button size="sm" variant="outline" onClick={createNewChat}>
              New chat <Plus size={18} className="ml-2" />
            </Button>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sessionList.map((item) => (
                <SidebarMenuItem key={item.sessionId}>
                  <SidebarMenuButton
                    asChild
                    isActive={isCurrentlyActive(item.sessionId)}
                  >
                    <a href={'/chat/' + item.sessionId}>
                      <span>{formatDate(item.date)}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
