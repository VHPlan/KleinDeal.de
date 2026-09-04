'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { MessageSquare, X, Send, ChevronLeft, User, Check, CheckCheck, Loader2, Minimize2, ExternalLink } from 'lucide-react';

interface Conversation {
  id: string;
  listingId: string;
  listingTitle?: string;
  listingImage?: string;
  partnerId: string;
  partnerName: string;
  partnerAvatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string;
}

export default function FloatingChat() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Poll conversations when logged in
  useEffect(() => {
    if (!user) return;

    async function loadConversations() {
      try {
        const res = await fetch(`/api/conversations?userId=${user!.id}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setConversations(
              data.map((c: any) => {
                const isBuyer = c.buyerId === user!.id;
                const partner = isBuyer ? c.seller : c.buyer;
                const lastMsg = c.messages?.[c.messages.length - 1];
                return {
                  id: c.id,
                  listingId: c.listingId,
                  listingTitle: c.listing?.title || 'Inserat',
                  listingImage: JSON.parse(c.listing?.images || '[]')?.[0],
                  partnerId: partner?.id || (isBuyer ? c.sellerId : c.buyerId),
                  partnerName: partner?.name || 'Verkäufer / Käufer',
                  partnerAvatar: partner?.avatar,
                  lastMessage: lastMsg?.content || 'Keine Nachrichten',
                  lastMessageTime: lastMsg?.createdAt ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
                  unreadCount: c.messages?.filter((m: any) => m.receiverId === user!.id && !m.read).length || 0,
                };
              })
            );
          }
        }
      } catch (e) {
        console.error('Floating chat conversations error:', e);
      }
    }

    loadConversations();
    const interval = setInterval(loadConversations, 6000);
    return () => clearInterval(interval);
  }, [user]);

  // Load messages when conversation is opened
  useEffect(() => {
    if (!activeConv || !user) return;

    async function loadMessages() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/messages?conversationId=${activeConv!.id}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setMessages(
              data.map((m: any) => ({
                id: m.id,
                senderId: m.senderId,
                receiverId: m.receiverId,
                text: m.content || m.text,
                createdAt: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              }))
            );
          }
        }
      } catch (e) {
        console.error('Error loading messages:', e);
      } finally {
        setIsLoading(false);
      }
    }

    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [activeConv, user]);

  // Scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv || !user || isSending) return;

    const textToSend = inputText.trim();
    setInputText('');
    setIsSending(true);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: activeConv.id,
          receiverId: activeConv.partnerId,
          content: textToSend,
        }),
      });

      if (res.ok) {
        const newMsg = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            id: newMsg.id || Date.now().toString(),
            senderId: user.id,
            receiverId: activeConv.partnerId,
            text: textToSend,
            createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (e) {
      console.error('Error sending floating chat message:', e);
    } finally {
      setIsSending(false);
    }
  };

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  if (!user) return null;

  return (
    <aside aria-label="Direktnachrichten Chat" className="fixed bottom-5 right-5 z-50">
      {/* Expanded Floating Messenger Box */}
      {isOpen ? (
        <div className="w-[340px] sm:w-[380px] h-[480px] bg-white border border-[#DEE3DE] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#17A673] to-[#12835B] text-white p-3.5 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              {activeConv && (
                <button
                  type="button"
                  onClick={() => setActiveConv(null)}
                  className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              <div className="min-w-0">
                <h3 className="font-extrabold text-sm truncate flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4" />
                  <span>{activeConv ? activeConv.partnerName : 'KleinDeal Messenger'}</span>
                </h3>
                {activeConv && (
                  <p className="text-[10px] text-white/80 truncate">
                    {activeConv.listingTitle}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Link
                href="/messages"
                title="Vollbild-Nachrichten öffnen"
                className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors cursor-pointer"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          {activeConv ? (
            /* Live Chat Screen */
            <div className="flex-1 flex flex-col min-h-0 bg-[#F6F7F4]">
              {/* Messages Stream */}
              <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
                {isLoading && messages.length === 0 ? (
                  <div className="text-center py-12 text-xs text-[#68716A]">
                    <Loader2 className="w-4 h-4 animate-spin mx-auto text-[#17A673] mb-1" />
                    <span>Lade Verlauf...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12 text-xs text-[#68716A] space-y-1">
                    <p className="font-bold text-[#151815]">Keine Nachrichten bisher</p>
                    <p className="text-[11px]">Schreibe die erste Nachricht an {activeConv.partnerName}!</p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.senderId === user.id;
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs font-medium break-words shadow-2xs ${
                            isMe
                              ? 'bg-[#17A673] text-white rounded-br-xs'
                              : 'bg-white text-[#151815] border border-[#DEE3DE] rounded-bl-xs'
                          }`}
                        >
                          {m.text}
                        </div>
                        <span className="text-[9px] text-[#68716A] mt-0.5 px-1 font-semibold">
                          {m.createdAt}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Bar */}
              <form
                onSubmit={handleSendMessage}
                className="p-2.5 bg-white border-t border-[#DEE3DE] flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Nachricht schreiben..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 bg-[#F6F7F4] border border-[#DEE3DE] rounded-xl px-3 py-2 text-xs font-medium text-[#151815] outline-none focus:border-[#17A673]"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isSending}
                  className="w-9 h-9 rounded-xl bg-[#17A673] hover:bg-[#12835B] text-white flex items-center justify-center transition-colors disabled:opacity-50 cursor-pointer shrink-0 shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          ) : (
            /* Conversations List Screen */
            <div className="flex-1 overflow-y-auto divide-y divide-[#DEE3DE]">
              {conversations.length === 0 ? (
                <div className="text-center py-16 px-4 space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-[#E9F7F1] text-[#17A673] mx-auto flex items-center justify-center">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-black text-[#151815]">Noch keine Chats</h4>
                  <p className="text-[11px] text-[#68716A]">
                    Stelle Fragen zu Anzeigen oder starte eine Unterhaltung mit Verkäufern.
                  </p>
                </div>
              ) : (
                conversations.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActiveConv(c)}
                    className="w-full p-3 hover:bg-[#F6F7F4] transition-colors flex items-center gap-3 text-left cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#E9F7F1] text-[#17A673] font-black text-sm flex items-center justify-center shrink-0 border border-[#DEE3DE]">
                      {c.partnerName.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-extrabold text-xs text-[#151815] truncate group-hover:text-[#17A673] transition-colors">
                          {c.partnerName}
                        </span>
                        <span className="text-[10px] text-[#68716A] font-semibold">
                          {c.lastMessageTime}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#68716A] truncate">
                        {c.lastMessage}
                      </p>
                    </div>

                    {c.unreadCount ? (
                      <span className="w-5 h-5 rounded-full bg-[#17A673] text-white text-[10px] font-black flex items-center justify-center shrink-0 shadow-2xs">
                        {c.unreadCount}
                      </span>
                    ) : null}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      ) : (
        /* Minimized Floating Trigger Button */
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="relative bg-gradient-to-r from-[#17A673] to-[#12835B] hover:opacity-95 text-white font-extrabold text-xs px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer scale-100 hover:scale-105 active:scale-95"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="hidden sm:inline">Messenger</span>

          {totalUnread > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-[#D94C3D] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
              {totalUnread}
            </span>
          )}
        </button>
      )}
    </aside>
  );
}
