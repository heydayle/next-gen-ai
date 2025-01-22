'use client';

import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { MessageList } from '@/components/ui/message-list';
import { useAutoScroll } from '@/hooks/use-auto-scroll';
import useChat from '@/hooks/use-chat';
import { cn } from '@/lib/utils';
import * as m from '@/paraglide/messages';

export function HeroForm({ session }: { session: string }) {
  const { form, handleGenerate, isPending, messageList } = useChat({
    sessionId: session,
  });
  const {
    containerRef,
    handleScroll,
    handleTouchStart,
  } = useAutoScroll([messageList]);
  useEffect(() => {
    form.setValue('sessionId', session);
  }, []);

  return (
    <div>
      <div
          ref={containerRef}
          onScroll={handleScroll}
          onTouchStart={handleTouchStart}
          className="h-[calc(100vh-161px)] overflow-y-auto px-6"
      >
        <MessageList
            messages={messageList}
            isTyping={isPending}
        />
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleGenerate)}
          className="flex justify-center gap-3 py-2"
        >
          <FormField
            control={form.control}
            name="question"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder={m.type_your_question()}
                    className={cn(
                      'md:w-96',
                      form.formState.errors.question && 'border-destructive'
                    )}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button variant="secondary" type="submit">
            {m.submit_form()}
          </Button>
        </form>
      </Form>
    </div>
  );
}
