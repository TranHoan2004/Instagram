import { Avatar } from '@heroui/react';

export interface UserChatItem {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

const UserListItem = ({ user, onClick, isSelected }: { user: UserChatItem, onClick: () => void, isSelected: boolean }) => (
  <li onClick={onClick} className={`flex items-center p-3 cursor-pointer ${isSelected ? 'bg-[#efefef] dark:bg-[#232323]' : 'hover:bg-[#f5f5f5] dark:hover:bg-[#121212]'}`}>
    <div className="relative">
      <Avatar className="min-w-8 min-h-8" src={user.avatar} alt={user.name} />
      {user.online && <span className="absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-white dark:border-gray-800" />}
    </div>
    <div className="flex-1 ml-4">
      <p className={`text-sm font-medium ${user.unreadCount > 0 ? 'text-black dark:text-white' : 'text-gray-800 dark:text-gray-200'}`}>{user.name}</p>
      <p className={`text-sm truncate ${user.unreadCount > 0 ? 'text-black dark:text-white font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>{user.lastMessage} · {user.lastMessageTime}</p>
    </div>
    {user.unreadCount > 0 && <span className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
  </li>
);

export default UserListItem;
