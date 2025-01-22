import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useToast } from '@/components/ui/use-toast';

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

  const initMessageHistory = () => {
    const localSessions = JSON.parse(localStorage?.getItem(sessionId) || '[]');
    if (localSessions?.length === 0) return;
    const messages = localSessions?.map((item: History) => ({
      id: Date.now().toString(),
      role: item.role,
      content: item.parts[0].text,
    }));
    setMessageList(messages);
  };

  useEffect(initMessageHistory, [sessionId]);

  const handleGenerate = async ({ question, sessionId }: FormSchema) => {
    try {
      const newMessage: History = {
        role: 'user',
        parts: [{ text: question }],
      };
      const newHistory = JSON.stringify([]);

      if (!localStorage.getItem(sessionId)) {
        localStorage.setItem(sessionId, newHistory);
      }
      const localSessions = JSON.parse(localStorage.getItem(sessionId) || '[]');

      localStorage.setItem(
        sessionId,
        JSON.stringify([...localSessions, newMessage])
      );
      setMessageList((prev) => {
        return [
          ...prev,
          {
            id: Date.now().toString(),
            role: newMessage.role,
            content: newMessage.parts[0].text,
          },
        ];
      });
      form.setValue('question', '');

      setIsPending(true);
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ body: question, localSessions }),
      });

      const data = await response;
      if (data.ok) {
        const result = await data.text();
        const modelSession: History = {
          role: 'model',
          parts: [{ text: JSON.parse(result).code }],
        };

        const localSessionsNew = JSON.parse(
          localStorage.getItem(sessionId) || '[]'
        );

        const newSessionsHistory = JSON.stringify([
          ...localSessionsNew,
          modelSession,
        ]);
        localStorage.setItem(sessionId, newSessionsHistory);
        setMessageList((prev) => {
          return [
            ...prev,
            {
              id: Date.now().toString(),
              role: modelSession.role,
              content: modelSession.parts[0].text,
            },
          ];
        });
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
  };
};

export default useChat;
