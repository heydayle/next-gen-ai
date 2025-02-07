import { PropsWithChildren } from 'react';

const ChatLayout = ({ children }: PropsWithChildren) => {
  return <div className="container">{children}</div>;
};

export default ChatLayout;
