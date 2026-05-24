import { redirect } from 'next/navigation';

export default function BotChatPage() {
  redirect('/messages?assistant=repo');
}
