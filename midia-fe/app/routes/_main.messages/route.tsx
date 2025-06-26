import { ChevronLeftIcon, FaceSmileIcon, InformationCircleIcon, MicrophoneIcon, PhoneIcon, PhotoIcon, PlusCircleIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import React, { useState, useEffect, useRef } from 'react';
import UserListItem, { type UserChatItem } from './UserListItem';
import MessageBubble, { type Message } from './MessageBubble';


const mockUsers: UserChatItem[] = [
  { id: 'user1', name: 'Laura Wilson', avatar: 'https://placehold.co/100x100/e9d5ff/4c1d95?text=LW', online: true, lastMessage: 'Hey, how are you?', lastMessageTime: '10m', unreadCount: 2 },
  { id: 'user2', name: 'Alex Johnson', avatar: 'https://placehold.co/100x100/d1fae5/065f46?text=AJ', online: false, lastMessage: 'Sounds good! See you then.', lastMessageTime: '3h', unreadCount: 0 },
  { id: 'user3', name: 'Chris Martinez', avatar: 'https://placehold.co/100x100/fee2e2/991b1b?text=CM', online: true, lastMessage: 'Can you send me the file?', lastMessageTime: '1d', unreadCount: 0 },
  { id: 'user4', name: 'Jessica Brown', avatar: 'https://placehold.co/100x100/fef3c7/92400e?text=JB', online: false, lastMessage: 'Happy Birthday! 🎉', lastMessageTime: '2d', unreadCount: 1 },
  { id: 'user5', name: 'Michael Davis', avatar: 'https://placehold.co/100x100/dbeafe/1e40af?text=MD', online: true, lastMessage: 'Typing...', lastMessageTime: 'now', unreadCount: 0 },
  { id: 'user6', name: 'Sophia Miller', avatar: 'https://placehold.co/100x100/fce7f3/9d2667?text=SM', online: false, lastMessage: 'Loved the photos!', lastMessageTime: '5d', unreadCount: 0 },
  { id: 'user7', name: 'David Garcia', avatar: 'https://placehold.co/100x100/e0e7ff/3730a3?text=DG', online: true, lastMessage: 'Okay, I\'ll check it out.', lastMessageTime: '1w', unreadCount: 0 },
];

const mockConversations: Record<string, Message[]> = {
  user1: [
    { id: 1, text: 'Hey, how are you?', timestamp: '10:30 AM', senderId: 'user1', isOwn: false },
    { id: 2, text: 'I\'m good, thanks! How about you?', timestamp: '10:31 AM', senderId: 'currentUser', isOwn: true },
    { id: 3, text: 'Doing great! Just working on the new project. It\'s coming along nicely.', timestamp: '10:31 AM', senderId: 'user1', isOwn: false },
    { id: 4, text: 'That\'s awesome to hear! Let me know if you need any help.', timestamp: '10:32 AM', senderId: 'currentUser', isOwn: true },
  ],
  user2: [
    { id: 1, text: 'Let\'s meet at 5 PM tomorrow.', timestamp: 'Yesterday', senderId: 'currentUser', isOwn: true },
    { id: 2, text: 'Sounds good! See you then.', timestamp: 'Yesterday', senderId: 'user2', isOwn: false },
  ],
   user3: [
    { id: 1, text: 'Hi, I need the design file for the new campaign.', timestamp: '1d ago', senderId: 'currentUser', isOwn: true },
    { id: 2, text: 'Can you send me the file?', timestamp: '1d ago', senderId: 'user3', isOwn: false },
  ],
  user4: [
    { id: 1, text: 'Happy Birthday! 🎉', timestamp: '2d ago', senderId: 'user4', isOwn: false },
  ],
  user5: [],
  user6: [
    { id: 1, text: 'Loved the photos!', timestamp: '5d ago', senderId: 'user6', isOwn: false },
  ],
  user7: [
     { id: 1, text: 'Check out this new library I found, it might be useful for our project.', timestamp: '1w ago', senderId: 'currentUser', isOwn: true },
     { id: 2, text: 'Okay, I\'ll check it out.', timestamp: '1w ago', senderId: 'user7', isOwn: false },
  ]
};


const Messages = () => {
  const [selectedUser, setSelectedUser] = useState<UserChatItem| null>(mockUsers[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedUser) setMessages(mockConversations[selectedUser.id] || []);
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;
    const newMsg: Message = {
      id: messages.length + 1,
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      senderId: 'currentUser',
      isOwn: true,
    };
    setMessages([...messages, newMsg]);
    setNewMessage('');
  };

  return (
    <div className="flex h-[calc(100vh-60px)] font-sans">
      <aside className={`w-full md:w-1/3 lg:w-1/4 border-r border-[#dbdbdb] dark:border-[#262626] flex-col ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-5"><h1 className="text-md font-bold">Messages</h1></div>
        <ul className="overflow-y-auto flex-1">
          {mockUsers.map(user => (
            <UserListItem key={user.id} user={user} onClick={() => setSelectedUser(user)} isSelected={selectedUser?.id === user.id} />
          ))}
        </ul>
      </aside>

      <main className={`flex-1 flex-col ${selectedUser ? 'flex' : 'hidden md:flex'}`}>
        {selectedUser ? (
          <>
            <header className="flex items-center p-3 border-b border-[#dbdbdb] dark:border-[#262626]">
              <button onClick={() => setSelectedUser(null)} className="md:hidden mr-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <ChevronLeftIcon className="w-6 h-6" />
              </button>
              <img className="w-10 h-10 rounded-full mr-4" src={selectedUser.avatar} alt={selectedUser.name} />
              <div className="flex-1">
                <h2 className="text-base font-semibold">{selectedUser.name}</h2>
                {selectedUser.online && <p className="text-xs text-gray-500 dark:text-gray-400">Active now</p>}
              </div>
              <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-300">
                {[PhoneIcon, VideoCameraIcon, InformationCircleIcon].map((Icon, idx) => (
                  <button key={idx} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><Icon /></button>
                ))}
              </div>
            </header>

            <div className="flex-1 p-4 overflow-y-auto bg-gray-50/50 dark:bg-black">
              <div className="flex flex-col space-y-4">
                {messages.map(msg => (<MessageBubble key={msg.id} message={msg} />))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <footer className="p-4">
              <form onSubmit={handleSendMessage} className="flex items-center border border-gray-200 dark:border-gray-800 rounded-full px-2 py-1">
                <span className="p-2 rounded-full cursor-pointer"><PlusCircleIcon className="w-6 h-6" /></span>
                <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} type="text" placeholder="Message..." className="flex-1 bg-transparent px-3 py-2 text-sm focus:outline-none" />
                {newMessage ? (
                  <button type="submit" className="px-3 py-1 text-sm font-semibold text-blue-500 hover:text-blue-600">Send</button>
                ) : (
                  <div className="flex items-center space-x-1">
                    {[MicrophoneIcon, PhotoIcon, FaceSmileIcon].map((Icon, idx) => (
                      <span key={idx} className="p-2 rounded-full cursor-pointer"><Icon className="w-6 h-6" /></span>
                    ))}
                  </div>
                )}
              </form>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 border-4 border-black dark:border-white rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="m22 2-11 11"/></svg>
            </div>
            <h2 className="mt-6 text-2xl font-light">Your Messages</h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Send private photos and messages to a friend or group.</p>
            <button className="mt-6 bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600">Send Message</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Messages;
