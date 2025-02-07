import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

import { useIndexedDB } from './use-db';

import { useToast } from '@/components/ui/use-toast';

export interface Chat {
  id?: string;
  histories: History[];
  date: string;
  sessionId: string;
}

interface History {
  role: string;
  parts: { text: string }[];
}

interface MessageItem {
  id: string;
  role: string;
  content: string;
}

const formSchema = z.object({
  question: z.string().min(3),
  sessionId: z.string().min(1),
});

type FormSchema = z.infer<typeof formSchema>;

const useChat = ({ sessionId }: { sessionId: string }) => {
  const { toast } = useToast();
  const {
    add,
    get,
    getAll,
    update,
    db,
    error: dbError,
  } = useIndexedDB<Chat>({
    dbName: 'devAIoka',
    storeName: 'Chat_sessions',
  });

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: '',
      sessionId: '',
    },
  });

  const [message, setMessage] = useState('');
  const [messageList, setMessageList] = useState<MessageItem[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isDbReady, setIsDbReady] = useState(false);

  const router = useRouter();
  const onNewChat = () => {
    const id = uuidv4();
    router.push(`/chat/${id}`);
  };

  const initMessageHistory = async () => {
    if (!isDbReady || dbError) return;

    try {
      const chatSessions = await getAll();
      const currentSession = chatSessions.find(
        (session) => session.sessionId === sessionId
      );

      if (currentSession && currentSession.histories) {
        const localSessions = currentSession.histories;
        console.log('localSessions', localSessions);

        if (localSessions?.length > 0) {
          const messages = localSessions.map((item: History) => ({
            id: Date.now().toString(),
            role: item.role,
            content: item.parts[0].text,
          }));
          setMessageList(messages);
        }
      }
    } catch (error) {
      console.error('Error initializing message history', error);
    }
  };

  useEffect(() => {
    if (db && !dbError) {
      setIsDbReady(true);
    }
  }, [db, dbError]);

  useEffect(() => {
    if (isDbReady) {
      initMessageHistory();
    }
  }, [isDbReady, sessionId]);

  const updateMessageList = async (sessions: History[]) => {
    const chatSessions = await getAll();
    const currentSession = chatSessions.find(
      (session) => session.sessionId === sessionId
    );
    if (currentSession && currentSession.sessionId) {
      await update({
        id: currentSession.sessionId,
        sessionId,
        histories: sessions,
        date: new Date().toISOString(),
      });
    }
  };

  const handleGenerate = async ({ question }: FormSchema) => {
    if (!isDbReady) {
      toast({ description: 'Database not ready' });
      return;
    }

    try {
      const newMessage: History = {
        role: 'user',
        parts: [{ text: question }],
      };

      const chatSessions = await getAll();
      const currentSession = chatSessions.find(
        (session) => session.sessionId === sessionId
      );

      const localSessions = currentSession?.histories || [];
      const updatedSessions = [...localSessions, newMessage];

      if (currentSession && currentSession.sessionId) {
        await update({
          id: sessionId,
          sessionId,
          histories: updatedSessions,
          date: new Date().toISOString(),
        });
      } else {
        await add({
          id: sessionId,
          sessionId,
          histories: updatedSessions,
          date: new Date().toISOString(),
        });
      }

      setMessageList((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: newMessage.role,
          content: newMessage.parts[0].text,
        },
      ]);

      form.setValue('question', '');
      setIsPending(true);

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          body: question,
          localSessions: updatedSessions,
        }),
      });

      const data = await response;
      if (data.ok) {
        const result = await data.text();
        const modelSession: History = {
          role: 'model',
          parts: [{ text: JSON.parse(result).code }],
        };
        const finalSessions = [...updatedSessions, modelSession];
        updateMessageList(finalSessions);

        setMessageList((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: modelSession.role,
            content: modelSession.parts[0].text,
          },
        ]);

        setMessage(JSON.parse(result).code);
      } else {
        toast({ description: 'error' });
        setIsError(true);
      }
    } catch (error) {
      setIsError(true);
      console.log(error);
    } finally {
      setIsPending(false);
    }
  };

  return {
    form,
    message,
    messageList,
    isPending,
    isError,
    setMessage,
    handleGenerate,
    initMessageHistory,
    isDbReady,
    onNewChat,
  };
};

export default useChat;
