# 🤖 MASTER PROMPT: AI CHATBOT IMPLEMENTATIE

## Dienst Informatie
- **Dienst:** AI Chatbot voor Klantenservice
- **Type:** Add-on voor bestaande website OF onderdeel van nieuw project
- **Prijsrange:** Vanaf €1.500 (basis) / €3.500+ (geavanceerd met RAG)
- **Doorlooptijd:** 1-3 weken
- **Maandelijkse kosten:** API kosten (OpenAI/Anthropic) ≈ €20-100/maand afhankelijk van volume

---

## 📋 KLANTGEGEVENS

```
BEDRIJFSNAAM: [Invullen]
WEBSITE URL: [https://...]
CONTACTPERSOON: [Invullen]
EMAIL: [Invullen]
TELEFOON: [Invullen]

=== CHATBOT CONTEXT ===
DOEL VAN CHATBOT:
- [ ] Leads genereren
- [ ] Veelgestelde vragen beantwoorden
- [ ] Bezoekers helpen met dienst selectie
- [ ] Support/klantenservice
- [ ] Afspraken inplannen
- [ ] Anders: ___

TOON/PERSOONLIJKHEID:
- [ ] Professioneel & zakelijk
- [ ] Vriendelijk & persoonlijk
- [ ] Informeel & toegankelijk
- [ ] Formeel & betrouwbaar

TAAL:
- [ ] Nederlands
- [ ] Engels
- [ ] Beide (detecteren)

NAAM VOOR BOT: [Bijv: "Ro" / "Bart's Assistent" / geen naam]
```

---

## 🎯 FUNCTIONELE REQUIREMENTS

```
=== KERNFUNCTIES ===
- [ ] Vragen beantwoorden over diensten
- [ ] Prijsinformatie geven (of doorverwijzen)
- [ ] Lead capture (naam, email, vraag)
- [ ] Doorverwijzen naar contact/offerte pagina
- [ ] Openingstijden/beschikbaarheid
- [ ] FAQ afhandelen

=== GEAVANCEERDE FUNCTIES ===
- [ ] Afspraak inplannen (Calendly/Cal.com integratie)
- [ ] Realtime beschikbaarheid checken
- [ ] Offerte indicatie geven
- [ ] Projecten/portfolio tonen
- [ ] Multi-turn conversaties (context onthouden)
- [ ] Handoff naar menselijke support

=== GRENZEN ===
Wat mag de bot NIET doen:
- [ ] Exacte prijzen noemen (alleen ranges)
- [ ] Beloftes maken over levertijden
- [ ] Technische details delen
- [ ] Concurrenten bespreken
- [ ] [Andere grenzen: ___]

=== ESCALATIE ===
Wanneer moet de bot doorverwijzen naar mens?
- [ ] Bij complexe projectvragen
- [ ] Bij klachten
- [ ] Bij prijsonderhandelingen
- [ ] Op verzoek van bezoeker
- [ ] Na X onbeantwoorde vragen
```

---

## 🛠️ TECHNISCHE OPTIES

### Optie 1: Vercel AI SDK + OpenAI (Aanbevolen)
```
VOORDELEN:
✅ Volledige controle
✅ Goedkoop (pay per use)
✅ Snelle responses
✅ RAG mogelijk voor kennisbank
✅ Past naadloos in Next.js

NADELEN:
❌ Zelf bouwen
❌ Zelf onderhouden

STACK:
- Vercel AI SDK
- OpenAI GPT-4o-mini (goedkoop, snel)
- Upstash Vector (voor RAG)
- Vercel KV (voor sessies)
```

### Optie 2: Vercel AI SDK + Anthropic Claude
```
VOORDELEN:
✅ Betere Nederlandse taal
✅ Veiliger (minder hallucinaties)
✅ Langere context

NADELEN:
❌ Iets duurder
❌ Soms trager

STACK:
- Vercel AI SDK
- Anthropic Claude 3.5 Haiku (snel) of Sonnet (beter)
```

### Optie 3: Managed Service (Intercom/Crisp)
```
VOORDELEN:
✅ Geen development nodig
✅ Dashboard voor beheer
✅ Ingebouwde analytics

NADELEN:
❌ Maandelijkse kosten (€50-200+)
❌ Minder controle
❌ Generieke ervaring
```

---

## 📁 PROJECT STRUCTUUR

```
/src/
├── app/
│   └── api/
│       └── chat/
│           └── route.ts            # Chat API endpoint
│
├── components/
│   └── chat/
│       ├── ChatWidget.tsx          # Floating chat button
│       ├── ChatWindow.tsx          # Chat interface
│       ├── ChatMessage.tsx         # Individual message
│       ├── ChatInput.tsx           # Input field
│       ├── ChatHeader.tsx          # Header met titel/close
│       ├── ChatSuggestions.tsx     # Quick action buttons
│       └── ChatTypingIndicator.tsx # "Bot is typing..."
│
├── lib/
│   ├── ai/
│   │   ├── client.ts               # AI client config
│   │   ├── system-prompt.ts        # System prompt
│   │   └── tools.ts                # Function calling tools
│   │
│   └── chat/
│       ├── knowledge-base.ts       # Embedded knowledge
│       └── lead-capture.ts         # Lead opslaan
│
├── hooks/
│   └── useChat.ts                  # Chat hook (Vercel AI)
│
└── data/
    └── knowledge-base.md           # Kennisbank voor RAG
```

---

## 📝 CURSOR AI INSTRUCTIES

### Fase 1: Dependencies & Setup

```
Installeer de benodigde packages:

npm install ai @ai-sdk/openai
# OF voor Anthropic:
npm install ai @ai-sdk/anthropic

Optioneel voor RAG:
npm install @upstash/vector

=== ENVIRONMENT VARIABLES ===
OPENAI_API_KEY=sk-...
# OF
ANTHROPIC_API_KEY=sk-ant-...

# Voor lead capture
RESEND_API_KEY=re_...
LEAD_NOTIFICATION_EMAIL=...
```

### Fase 2: System Prompt

```typescript
// src/lib/ai/system-prompt.ts

export const SYSTEM_PROMPT = `
Je bent de virtuele assistent van [BEDRIJFSNAAM]. Je naam is [BOT_NAAM].

## OVER JOU
- Je bent vriendelijk, behulpzaam en professioneel
- Je communiceert in het Nederlands (tenzij de bezoeker Engels spreekt)
- Je vertegenwoordigt [CONTACTPERSOON], de eigenaar van [BEDRIJFSNAAM]
- Je bent beschikbaar 24/7 om vragen te beantwoorden

## OVER [BEDRIJFSNAAM]
[KORTE BEDRIJFSBESCHRIJVING]

## DIENSTEN
[LIJST VAN DIENSTEN MET KORTE BESCHRIJVING]

## PRIJSINDICATIES
[PRIJSRANGES - alleen als publiek]

## WERKWIJZE
1. Kennismakingsgesprek
2. Voorstel & offerte
3. Ontwikkeling
4. Oplevering & support

## CONTACT
- Email: [EMAIL]
- Telefoon: [TELEFOON]
- WhatsApp: [WHATSAPP]

## JOUW TAKEN
1. Beantwoord vragen over onze diensten
2. Help bezoekers het juiste pakket te kiezen
3. Verzamel contactgegevens voor leads
4. Verwijs door naar de offerte pagina voor concrete aanvragen
5. Geef duidelijk aan wanneer een menselijke reactie nodig is

## REGELS
- Geef NOOIT exacte prijzen, alleen indicaties
- Beloof NOOIT specifieke levertijden
- Verwijs naar de offerte pagina voor concrete prijzen
- Bij complexe vragen: vraag of ze contact willen opnemen
- Wees eerlijk als je iets niet weet
- Vraag naar naam en email als de bezoeker geïnteresseerd lijkt

## TONE OF VOICE
- Spreek bezoekers aan met "je/jij" (informeel maar respectvol)
- Wees bondig maar compleet
- Gebruik geen emoji's tenzij de bezoeker dit doet
- Eindig antwoorden vaak met een relevante vervolgvraag

## VOORBEELDEN
Bezoeker: "Wat kost een website?"
Jij: "Dat hangt af van je wensen! Een starter website begint vanaf €1.295, een uitgebreide bedrijfswebsite vanaf €2.995. Mag ik vragen wat voor website je zoekt? Dan kan ik je een betere indicatie geven."

Bezoeker: "Hoe lang duurt het?"
Jij: "Een simpele website kan binnen 1-2 weken klaar zijn, grotere projecten 3-4 weken. De exacte planning bespreken we graag in een persoonlijk gesprek. Zal ik je doorverwijzen naar onze offerte pagina?"
`;
```

### Fase 3: Chat API Route

```typescript
// src/app/api/chat/route.ts

import { openai } from '@ai-sdk/openai';
import { streamText, convertToCoreMessages } from 'ai';
import { SYSTEM_PROMPT } from '@/lib/ai/system-prompt';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai('gpt-4o-mini'),
    system: SYSTEM_PROMPT,
    messages: convertToCoreMessages(messages),
    maxTokens: 500,
    temperature: 0.7,
  });

  return result.toDataStreamResponse();
}
```

### Fase 4: Chat Widget Component

```typescript
// src/components/chat/ChatWidget.tsx

'use client';

import { useState } from 'react';
import { useChat } from 'ai/react';
import { MessageCircle, X, Send } from 'lucide-react';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Hoi! 👋 Ik ben [BOT_NAAM], de virtuele assistent van [BEDRIJFSNAAM]. Hoe kan ik je helpen?',
      },
    ],
  });

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-all z-50 ${isOpen ? 'hidden' : 'flex'} items-center justify-center`}
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-slate-200">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-indigo-600 text-white rounded-t-2xl">
            <div>
              <h3 className="font-semibold">[BEDRIJFSNAAM]</h3>
              <p className="text-sm text-indigo-200">Online - Antwoord binnen seconden</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-indigo-700 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 rounded-2xl px-4 py-2 text-slate-500">
                  <span className="animate-pulse">Aan het typen...</span>
                </div>
              </div>
            )}
          </div>

          {/* Suggestions (for first message) */}
          {messages.length === 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {['Wat kost een website?', 'Welke diensten bieden jullie?', 'Hoe werkt het proces?'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    handleInputChange({ target: { value: suggestion } } as any);
                    setTimeout(() => handleSubmit({} as any), 100);
                  }}
                  className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full hover:bg-indigo-100"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="Stel je vraag..."
                className="flex-1 px-4 py-2 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
```

### Fase 5: Lead Capture

```typescript
// src/lib/chat/lead-capture.ts

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface Lead {
  name: string;
  email: string;
  interest: string;
  conversation: string;
}

export async function captureLead(lead: Lead) {
  // Stuur notificatie email
  await resend.emails.send({
    from: 'noreply@[DOMEIN]',
    to: process.env.LEAD_NOTIFICATION_EMAIL!,
    subject: `Nieuwe lead via chatbot: ${lead.name}`,
    html: `
      <h2>Nieuwe lead via chatbot</h2>
      <p><strong>Naam:</strong> ${lead.name}</p>
      <p><strong>Email:</strong> ${lead.email}</p>
      <p><strong>Interesse:</strong> ${lead.interest}</p>
      <h3>Conversatie:</h3>
      <pre>${lead.conversation}</pre>
    `,
  });

  // TODO: Opslaan in database/CRM
}
```

### Fase 6: Knowledge Base (RAG) - Geavanceerd

```typescript
// Voor grotere kennisbanken, gebruik RAG:
// 1. Embed alle content met OpenAI embeddings
// 2. Sla op in Upstash Vector
// 3. Bij elke vraag: zoek relevante context
// 4. Voeg context toe aan system prompt

// src/lib/ai/rag.ts

import { Index } from '@upstash/vector';

const index = new Index({
  url: process.env.UPSTASH_VECTOR_URL!,
  token: process.env.UPSTASH_VECTOR_TOKEN!,
});

export async function getRelevantContext(query: string) {
  const results = await index.query({
    data: query,
    topK: 3,
    includeMetadata: true,
  });

  return results
    .map((r) => r.metadata?.content)
    .filter(Boolean)
    .join('\n\n');
}
```

---

## 📚 KNOWLEDGE BASE TEMPLATE

Maak een uitgebreid kennisdocument dat de chatbot gebruikt:

```markdown
# [BEDRIJFSNAAM] Knowledge Base

## BEDRIJFSINFORMATIE
- Naam: [BEDRIJFSNAAM]
- Eigenaar: [NAAM]
- Opgericht: [JAAR]
- Locatie: [STAD]
- Email: [EMAIL]
- Telefoon: [TELEFOON]
- WhatsApp: [NUMMER]

## DIENSTEN

### 1. Starter Website
- Prijs: Vanaf €1.295
- Doorlooptijd: 1-2 weken
- Pagina's: 1-3
- Inclusief: Responsive design, contactformulier, basis SEO
- Ideaal voor: ZZP'ers, starters, kleine bedrijven

### 2. Business Website
- Prijs: Vanaf €2.995
- Doorlooptijd: 2-4 weken
- Pagina's: 5-10
- Inclusief: CMS, blog, geavanceerde SEO, offerte formulier
- Ideaal voor: MKB, dienstverleners

### 3. Webshop
- Prijs: Vanaf €4.995
- Doorlooptijd: 3-5 weken
- Inclusief: iDEAL, voorraadbeheer, orderbeheer
- Ideaal voor: Retailers, productverkoop

### 4. Maatwerk Web Applicatie
- Prijs: Vanaf €9.995
- Doorlooptijd: 6-12 weken
- Volledig op specificatie

## WERKWIJZE
1. Kennismakingsgesprek (gratis, vrijblijvend)
2. Voorstel met specificaties en prijs
3. Akkoord en aanbetaling
4. Design en ontwikkeling (met tussentijdse updates)
5. Testen en feedback
6. Oplevering + training
7. 30 dagen gratis support

## VEELGESTELDE VRAGEN

### Prijzen
Q: Wat kost een website?
A: Dat hangt af van je wensen. Een starter website begint vanaf €1.295, een business website vanaf €2.995. Voor een exacte prijs maken we graag een offerte op maat.

Q: Zijn er verborgen kosten?
A: Nee, we zijn 100% transparant. Hosting en domeinnaam zijn aparte kosten (ca. €10-20/maand), maar dit bespreken we vooraf.

### Doorlooptijden
Q: Hoe snel kan mijn website af zijn?
A: Een starter website kan binnen 1-2 weken klaar zijn. Grotere projecten duren 3-4 weken. Dit hangt ook af van hoe snel jij feedback geeft.

### Technisch
Q: Welke technologie gebruiken jullie?
A: Wij bouwen met Next.js en React - moderne, snelle technologie die goed scoort in Google.

Q: Kan ik zelf teksten aanpassen?
A: Ja! We leveren uitleg hoe je dit doet, of we bieden een onderhoudspakket aan.

### Support
Q: Wat als er iets kapot gaat?
A: Na oplevering krijg je 30 dagen gratis support. Daarna kun je kiezen voor een onderhoudspakket.

## UNIQUE SELLING POINTS
- Persoonlijk contact (je werkt direct met de developer)
- Snelle communicatie (altijd bereikbaar via WhatsApp)
- Moderne technologie (snel, SEO-vriendelijk)
- Transparante prijzen (geen verrassingen)
- 30 dagen gratis support na oplevering
```

---

## ✅ OPLEVERING CHECKLIST

### Functionaliteit
- [ ] Chat widget laadt correct
- [ ] Berichten worden verstuurd en ontvangen
- [ ] Bot antwoordt relevant op vragen
- [ ] Suggestie knoppen werken
- [ ] Mobile responsive
- [ ] Open/close animatie smooth

### AI Kwaliteit
- [ ] Bot kent alle diensten
- [ ] Prijzen worden als ranges genoemd
- [ ] Doorverwijzing naar contact/offerte werkt
- [ ] Bot vraagt naar contactgegevens
- [ ] Nederlandse taal correct
- [ ] Toon past bij bedrijf

### Lead Capture
- [ ] Leads worden opgeslagen
- [ ] Notificatie email wordt verstuurd
- [ ] Conversatie wordt bewaard

### Performance
- [ ] Eerste response < 2 seconden
- [ ] Streaming werkt (tekst verschijnt geleidelijk)
- [ ] Geen errors in console
- [ ] API errors worden afgehandeld

---

## 📊 MONITORING & ANALYTICS

```
=== TE METEN ===
- Aantal conversaties per dag/week
- Gemiddelde conversatie lengte
- Leads gegenereerd via chat
- Veelgestelde vragen (voor FAQ verbetering)
- Momenten waarop bot niet kon helpen

=== TOOLS ===
- Vercel Analytics (basis)
- PostHog (geavanceerd, gratis tier)
- Custom logging naar database
```

---

## 💰 KOSTEN INSCHATTING

```
=== API KOSTEN (OpenAI GPT-4o-mini) ===
Input: $0.15 / 1M tokens
Output: $0.60 / 1M tokens

Gemiddelde conversatie: ~500 tokens
100 conversaties/maand: ~€2
1.000 conversaties/maand: ~€15
10.000 conversaties/maand: ~€150

=== HOSTING ===
Vercel: Gratis (hobby) of $20/maand (pro)
Upstash Vector: Gratis tier tot 10K queries

=== TOTAAL ===
Kleine website: €5-20/maand
Drukke website: €50-150/maand
```

---

*Master Prompt Versie 1.0 | RoTech Development | Januari 2026*
