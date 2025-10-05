'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Github, Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { apiClient } from '@/services/apiClient';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function BotChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content:
        '你好！我是 Relax-Git 助手 🤖\n\n我可以帮助你了解 Relax-Git 的功能：\n• 代码仓库管理\n• 聊天室功能\n• 好友系统\n• 实时消息\n\n试着给我发送一条消息吧！',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const userInput = inputValue;
    setInputValue('');
    setIsTyping(true);

    try {
      // 调用真实的 DeepSeek AI
      const conversationHistory = messages
        .slice(-10) // 只保留最近10条消息作为上下文
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content,
        }));

      const response = await apiClient.post('/ai/chat', {
        message: userInput,
        conversationHistory,
      });

      const data = response.data;

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.reply || '抱歉，我暂时无法回答。',
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('AI chat error:', error);

      // 错误回退消息
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '抱歉，我遇到了一些技术问题。请稍后再试，或联系管理员。',
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* 聊天头部 */}
      <header className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="container-responsive flex h-16 items-center gap-4">
          <Link href="/chatroom">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>

          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white">
                <Github className="h-5 w-5" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-background rounded-full" />
            </div>
            <div>
              <div className="font-semibold">relax-git</div>
              <div className="text-xs text-muted-foreground">在线 • 机器人</div>
            </div>
          </div>
        </div>
      </header>

      {/* 消息区域 */}
      <main className="flex-1 container-responsive py-4 overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className="flex items-start gap-2 max-w-[70%]">
                  {message.sender === 'bot' && (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white flex-shrink-0">
                      <Github className="h-4 w-4" />
                    </div>
                  )}

                  <div
                    className={`rounded-2xl px-4 py-2 ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm">
                      {message.content}
                    </div>
                    <div
                      className={`text-xs mt-1 ${
                        message.sender === 'user'
                          ? 'text-primary-foreground/70'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>

                  {message.sender === 'user' && (
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold flex-shrink-0">
                      你
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start gap-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white">
                    <Github className="h-4 w-4" />
                  </div>
                  <div className="bg-muted rounded-2xl px-4 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                        style={{ animationDelay: '0.1s' }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 输入区域 */}
          <div className="border-t pt-4 mt-4">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入消息..."
                className="flex-1"
                disabled={isTyping}
              />
              <Button
                onClick={handleSend}
                disabled={!inputValue.trim() || isTyping}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
