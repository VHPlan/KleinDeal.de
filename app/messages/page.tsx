'use client';

import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { 
  MessageSquare, 
  Send, 
  User, 
  ArrowLeft, 
  Lock, 
  Clock, 
  CheckCheck,
  Tag,
  ShieldAlert,
  Coins,
  Check,
  X,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';

interface ConversationItem {
  id: string;
  listing: { id: string; title: string; price: number; image: string } | null;
  otherUser: { id: string; name: string; avatar?: string };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface MessageItem {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender: { id: string; name: string };
}

export default function MessagesPage() {
  const { user, openAuthModal } = useAuth();
  const { t } = useLanguage();

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [counterAmount, setCounterAmount] = useState('');
  const [counterModalOpen, setCounterModalOpen] = useState<string | null>(null);
  const [newOfferAmount, setNewOfferAmount] = useState('');
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations list
  useEffect(() => {
    if (!user?.id) return;
    const currentUserId = user.id;
    async function loadConversations() {
      try {
        const res = await fetch(`/api/conversations?userId=${currentUserId}`);
        if (res.ok) {
          const data = await res.json();
          setConversations(data);
          if (data.length > 0) {
            setSelectedConvId((prev) => prev || data[0].id);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadConversations();
  }, [user]);

  // Load messages and offers for selected conversation
  useEffect(() => {
    if (!user?.id || !selectedConvId) return;
    const currentUserId = user.id;
    async function loadThreadData() {
      try {
        const resMsg = await fetch(`/api/messages?conversationId=${selectedConvId}&userId=${currentUserId}`);
        if (resMsg.ok) {
          setMessages(await resMsg.json());
        }

        const resOffers = await fetch(`/api/offers?conversationId=${selectedConvId}`);
        if (resOffers.ok) {
          setOffers(await resOffers.json());
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadThreadData();
  }, [selectedConvId, user]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!user) {
    return (
      <main className="min-h-screen bg-[#F6F7F4] pb-20">
        <Header />
        <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#E9F7F1] text-[#17A673] mx-auto flex items-center justify-center">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-[#151815]">Nachrichten</h2>
          <p className="text-xs text-[#68716A]">
            Bitte melde dich an, um auf deine Nachrichten und Preisangebote zuzugreifen.
          </p>
          <button
            onClick={() => openAuthModal('login')}
            className="bg-[#17A673] hover:bg-[#12835B] text-white font-bold text-xs px-6 py-3 rounded-xl"
          >
            Jetzt anmelden
          </button>
        </div>
      </main>
    );
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConvId || sending) return;

    setSending(true);
    const contentToSend = newMessage.trim();
    setNewMessage('');

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConvId,
          content: contentToSend,
        }),
      });

      if (res.ok) {
        const sentMsg = await res.json();
        setMessages((prev) => [...prev, sentMsg]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const handleOfferAction = async (offerId: string, action: string, counter?: number) => {
    try {
      const res = await fetch('/api/offers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offerId,
          action,
          counterAmount: counter,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setOffers(offers.map((o) => (o.id === offerId ? updated : o)));
        setCounterModalOpen(null);
        setCounterAmount('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentConv?.listing || !newOfferAmount) return;

    try {
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: currentConv.listing.id,
          conversationId: selectedConvId,
          amount: parseFloat(newOfferAmount),
        }),
      });

      if (res.ok) {
        const newOffer = await res.json();
        setOffers([newOffer, ...offers]);
        setOfferModalOpen(false);
        setNewOfferAmount('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const currentConv = conversations.find((c) => c.id === selectedConvId);

  return (
    <main className="min-h-screen bg-[#F6F7F4] pb-20">
      <Header />

      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#68716A] hover:text-[#151815] mb-6">
          <ArrowLeft className="w-4 h-4" />
          <span>Zurück zur Startseite</span>
        </Link>

        {/* Safety Warning Banner */}
        <div className="mb-6 p-3.5 bg-[#E9F7F1] border border-[#17A673]/30 rounded-xl text-xs text-[#171A17] flex items-center gap-3 shadow-sm">
          <ShieldAlert className="w-5 h-5 text-[#17A673] flex-shrink-0" />
          <div>
            <strong>Sicherheitshinweis:</strong> Führe Preisverhandlungen und Absprachen stets über KleinDeal.de.
            Gib niemals Passwörter oder Verifizierungscodes an andere Nutzer weiter.
          </div>
        </div>

        <h1 className="text-2xl font-black text-[#151815] mb-6">Meine Nachrichten & Verhandlungen</h1>

        <div className="bg-white border border-[#DEE3DE] rounded-xl overflow-hidden shadow-subtle grid grid-cols-1 md:grid-cols-12 min-h-[550px]">
          
          {/* Conversation List (Left Column) */}
          <div className="md:col-span-4 border-r border-[#DEE3DE] bg-[#F6F7F4] p-3 space-y-2 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-xs text-[#68716A]">Lade Nachrichten...</div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#68716A] space-y-2">
                <MessageSquare className="w-8 h-8 text-[#68716A] mx-auto opacity-50" />
                <p>Noch keine Nachrichten vorhanden.</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => setSelectedConvId(conv.id)}
                  className={`w-full p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                    selectedConvId === conv.id
                      ? 'bg-white border-[#17A673] shadow-subtle'
                      : 'bg-[#F6F7F4] border-transparent hover:bg-white'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-[#171A17] text-white font-bold text-sm flex items-center justify-center shrink-0">
                    {conv.otherUser.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-xs mb-0.5">
                      <span className="font-bold text-[#151815] truncate">{conv.otherUser.name}</span>
                      <span className="text-[10px] text-[#68716A]">{conv.lastMessageTime}</span>
                    </div>
                    {conv.listing && (
                      <span className="block text-[11px] font-semibold text-[#17A673] truncate">
                        {conv.listing.title}
                      </span>
                    )}
                    <p className="text-xs text-[#68716A] truncate mt-0.5">{conv.lastMessage}</p>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Messages Thread & Offers (Right Column) */}
          <div className="md:col-span-8 flex flex-col justify-between bg-white min-h-[500px]">
            
            {currentConv ? (
              <>
                {/* Thread Header */}
                <div className="p-4 border-b border-[#DEE3DE] bg-[#F6F7F4] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#171A17] text-white font-bold text-xs flex items-center justify-center">
                      {currentConv.otherUser.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-xs text-[#151815]">{currentConv.otherUser.name}</h3>
                      {currentConv.listing && (
                        <span className="text-[11px] font-semibold text-[#17A673]">
                          Anzeige: {currentConv.listing.title} ({currentConv.listing.price} €)
                        </span>
                      )}
                    </div>
                  </div>
                  {currentConv.listing && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setOfferModalOpen(true)}
                        className="px-3 py-1.5 bg-[#171A17] text-white text-xs font-bold rounded-lg hover:bg-[#252825] flex items-center gap-1"
                      >
                        <Coins className="w-3.5 h-3.5 text-[#17A673]" />
                        <span>Angebot machen</span>
                      </button>
                      <Link
                        href={`/listing/${currentConv.listing.id}`}
                        className="text-xs font-semibold text-[#17A673] hover:underline"
                      >
                        Anzeige ansehen
                      </Link>
                    </div>
                  )}
                </div>

                {/* Structured Offers Display Card */}
                {offers.length > 0 && (
                  <div className="p-3 bg-[#FAFBFA] border-b border-[#DEE3DE] space-y-2">
                    {offers.map((offer) => {
                      const isBuyer = offer.buyerId === user.id;
                      const isSeller = offer.sellerId === user.id;

                      return (
                        <div key={offer.id} className="p-3 border border-[#DEE3DE] rounded-lg bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                offer.status === 'ACCEPTED'
                                  ? 'bg-[#E9F7F1] text-[#17A673] border-[#17A673]/30'
                                  : offer.status === 'COUNTERED'
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-[#F6F7F4] text-[#171A17] border-[#DEE3DE]'
                              }`}>
                                {offer.status === 'ACCEPTED' ? 'Angenommen' : offer.status === 'COUNTERED' ? 'Gegenangebot' : offer.status}
                              </span>
                              <span className="font-bold text-[#171A17]">
                                {offer.status === 'COUNTERED' ? `${offer.counterAmount} € (Gegenangebot)` : `${offer.amount} €`}
                              </span>
                            </div>
                            <div className="text-[11px] text-[#68716A]">
                              {isBuyer ? 'Dein Angebot an den Verkäufer' : `Angebot von ${offer.buyer?.name || 'Käufer'}`}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          {offer.status === 'PENDING' && isSeller && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleOfferAction(offer.id, 'ACCEPT')}
                                className="px-2.5 py-1.5 bg-[#17A673] text-white rounded font-bold hover:bg-[#12835B] flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" /> Annehmen
                              </button>
                              <button
                                onClick={() => setCounterModalOpen(offer.id)}
                                className="px-2.5 py-1.5 bg-[#171A17] text-white rounded font-bold hover:bg-[#252825]"
                              >
                                Gegenangebot
                              </button>
                              <button
                                onClick={() => handleOfferAction(offer.id, 'REJECT')}
                                className="px-2.5 py-1.5 border border-[#DEE3DE] text-[#68716A] rounded hover:bg-[#F6F7F4]"
                              >
                                Ablehnen
                              </button>
                            </div>
                          )}

                          {offer.status === 'COUNTERED' && isBuyer && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleOfferAction(offer.id, 'ACCEPT')}
                                className="px-2.5 py-1.5 bg-[#17A673] text-white rounded font-bold hover:bg-[#12835B]"
                              >
                                Gegenangebot annehmen
                              </button>
                              <button
                                onClick={() => handleOfferAction(offer.id, 'REJECT')}
                                className="px-2.5 py-1.5 border border-[#DEE3DE] text-[#68716A] rounded hover:bg-[#F6F7F4]"
                              >
                                Ablehnen
                              </button>
                            </div>
                          )}

                          {offer.status === 'PENDING' && isBuyer && (
                            <button
                              onClick={() => handleOfferAction(offer.id, 'WITHDRAW')}
                              className="px-2.5 py-1.5 border border-rose-200 text-[#D94C3D] rounded hover:bg-rose-50"
                            >
                              Zurückziehen
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Messages Body */}
                <div className="p-4 flex-1 overflow-y-auto space-y-3 max-h-[380px]">
                  {messages.length === 0 ? (
                    <div className="py-12 text-center text-xs text-[#68716A]">
                      Schreibe eine Nachricht, um das Gespräch zu beginnen.
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.senderId === user.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[75%] p-3 rounded-xl text-xs leading-relaxed ${
                              isMe
                                ? 'bg-[#17A673] text-white font-medium rounded-br-none'
                                : 'bg-[#F6F7F4] border border-[#DEE3DE] text-[#151815] rounded-bl-none'
                            }`}
                          >
                            <p className="whitespace-pre-line">{msg.content}</p>
                            <span
                              className={`block text-[9px] mt-1 text-right ${
                                isMe ? 'text-emerald-100' : 'text-[#68716A]'
                              }`}
                            >
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Send Input Bar */}
                <form onSubmit={handleSendMessage} className="p-3 border-t border-[#DEE3DE] bg-[#F6F7F4] flex gap-2">
                  <input
                    type="text"
                    placeholder="Nachricht schreiben..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 bg-white border border-[#DEE3DE] rounded-xl px-4 py-2.5 text-xs text-[#151815] focus:outline-none focus:border-[#17A673]"
                  />
                  <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="bg-[#17A673] hover:bg-[#12835B] text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <span>Senden</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-xs text-[#68716A]">
                <MessageSquare className="w-10 h-10 text-[#DEE3DE] mb-2" />
                <p>Wähle eine Konversation aus der Liste aus.</p>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* New Offer Modal */}
      {offerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form onSubmit={handleCreateOffer} className="bg-white rounded-xl max-w-sm w-full p-6 space-y-4 border border-[#DEE3DE]">
            <h3 className="font-bold text-base text-[#171A17]">Preisangebot machen</h3>
            <p className="text-xs text-[#68716A]">
              Angebot für „{currentConv?.listing?.title}“ (Originalpreis: {currentConv?.listing?.price} €)
            </p>
            <div>
              <label className="block text-xs font-semibold mb-1">Dein Angebotsbetrag (€)</label>
              <input
                type="number"
                step="any"
                required
                min={1}
                placeholder="z. B. 120"
                value={newOfferAmount}
                onChange={(e) => setNewOfferAmount(e.target.value)}
                className="w-full bg-[#F6F7F4] border rounded-lg p-2.5 text-xs font-bold"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setOfferModalOpen(false)}
                className="px-4 py-2 border rounded-lg text-xs"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#17A673] text-white font-bold rounded-lg text-xs hover:bg-[#12835B]"
              >
                Angebot senden
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Counter Offer Modal */}
      {counterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 space-y-4 border border-[#DEE3DE]">
            <h3 className="font-bold text-base text-[#171A17]">Gegenangebot senden</h3>
            <div>
              <label className="block text-xs font-semibold mb-1">Betrag für dein Gegenangebot (€)</label>
              <input
                type="number"
                step="any"
                required
                min={1}
                placeholder="z. B. 140"
                value={counterAmount}
                onChange={(e) => setCounterAmount(e.target.value)}
                className="w-full bg-[#F6F7F4] border rounded-lg p-2.5 text-xs font-bold"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCounterModalOpen(null)}
                className="px-4 py-2 border rounded-lg text-xs"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={() => handleOfferAction(counterModalOpen, 'COUNTER', parseFloat(counterAmount))}
                className="px-4 py-2 bg-[#171A17] text-white font-bold rounded-lg text-xs hover:bg-[#252825]"
              >
                Gegenangebot absenden
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
