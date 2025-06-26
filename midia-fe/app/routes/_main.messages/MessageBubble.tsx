export interface Message {
  id: number;
  text: string;
  timestamp: string;
  senderId: string;
  isOwn: boolean;
}

const MessageBubble = ({ message }: { message: Message }) => {
  const bubbleClasses = message.isOwn ? 'bg-blue-500 text-white self-end rounded-full' : 'bg-[#efefef] dark:bg-[#232323] text-black dark:text-white self-start rounded-full';
  return (
    <div className={`flex items-end gap-2 ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs md:max-w-md px-4 py-2.5 ${bubbleClasses}`}>
        <p className="text-sm">{message.text}</p>
      </div>
    </div>
  );
};

export default MessageBubble;