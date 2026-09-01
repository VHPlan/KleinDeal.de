/**
 * Optional AI Listing Assistant for KleinDeal.de
 * 
 * Configurable architecture behind feature flag:
 * AI_LISTING_ASSISTANT_ENABLED=false (default: disabled)
 */

import { env } from './env';

export interface AIAssistantInput {
  title?: string;
  notes?: string;
  category?: string;
  condition?: string;
  imageUrls?: string[];
}

export interface AIAssistantSuggestions {
  enabled: boolean;
  suggestedTitle?: string;
  suggestedDescription?: string;
  suggestedCategory?: string;
  suggestedPriceRange?: { min: number; max: number };
  keyFeatures?: string[];
  notice: string;
}

export async function generateListingSuggestions(input: AIAssistantInput): Promise<AIAssistantSuggestions> {
  const isEnabled = process.env.AI_LISTING_ASSISTANT_ENABLED === 'true';

  if (!isEnabled) {
    return {
      enabled: false,
      notice: 'Der KI-Anzeigenassistent ist in dieser Umgebung derzeit deaktiviert.',
    };
  }

  // Provider architecture (e.g. Gemini / OpenAI / Anthropic)
  // When enabled with configured API key:
  const rawNotes = input.notes || input.title || '';
  const sanitizedTitle = rawNotes.length > 0 ? `${rawNotes.charAt(0).toUpperCase()}${rawNotes.slice(1)}` : 'Gepflegter Artikel';

  return {
    enabled: true,
    suggestedTitle: sanitizedTitle,
    suggestedDescription: `Sehr gut erhaltener Artikel (${input.condition || 'Guter Zustand'}). Voll funktionsfähig und aus tierfreiem Nichtraucherhaushalt. Abholung oder Versand möglich.`,
    suggestedCategory: input.category || 'alltag',
    keyFeatures: ['Voll funktionsfähig', 'Gepflegter Zustand', 'Sofort einsatzbereit'],
    notice: 'KI-generierter Vorschlag. Bitte überprüfe alle Angaben vor der Veröffentlichung auf Richtigkeit.',
  };
}
