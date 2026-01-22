import { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";

export const metadata: Metadata = {
  title: "Privacyverklaring",
  description: "Lees onze privacyverklaring. Wij gaan zorgvuldig en transparant om met uw persoonsgegevens conform de AVG.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Privacyverklaring", url: "/privacy" },
        ]}
      />

      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Privacyverklaring</h1>
            <p className="text-slate-500 mb-8">Laatst bijgewerkt: 21 januari 2026</p>
            
            <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-p:text-slate-600 prose-li:text-slate-600">
              
              <p className="text-lg">
                BVR Services, handelend onder de naam RoTech Development (&ldquo;wij&rdquo;, &ldquo;ons&rdquo;, &ldquo;onze&rdquo;), 
                hecht grote waarde aan de bescherming van uw persoonsgegevens. In deze privacyverklaring 
                leggen wij uit welke gegevens wij verzamelen, op welke grondslag, waarom, en hoe wij deze beschermen, 
                conform de Algemene Verordening Gegevensbescherming (AVG/GDPR).
              </p>

              <h2>1. Verwerkingsverantwoordelijke</h2>
              <p>
                De verwerkingsverantwoordelijke voor de verwerking van uw persoonsgegevens is:
              </p>
              <p>
                <strong>BVR Services</strong><br />
                Handelend onder: RoTech Development<br />
                Adres: Kruisstraat 64, 5502 JG Veldhoven, Nederland<br />
                KvK-nummer: 86858173<br />
                E-mail: contact@ro-techdevelopment.dev<br />
                Telefoon: +31 6 57 23 55 74
              </p>
              <p>
                Bart van Rooij is de functioneel verantwoordelijke voor de gegevensverwerking. Bij vragen over 
                deze privacyverklaring of uw rechten kunt u contact opnemen via bovenstaande gegevens.
              </p>

              <h2>2. Welke persoonsgegevens verzamelen wij?</h2>
              <p>Wij verzamelen en verwerken de volgende categorieën persoonsgegevens:</p>
              
              <h3>2.1 Gegevens die u zelf verstrekt</h3>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="text-left py-2 px-3">Categorie</th>
                    <th className="text-left py-2 px-3">Voorbeelden</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 px-3">Contactgegevens</td>
                    <td className="py-2 px-3">Naam, e-mailadres, telefoonnummer</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-3">Bedrijfsgegevens</td>
                    <td className="py-2 px-3">Bedrijfsnaam, KvK-nummer, BTW-nummer</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-3">Adresgegevens</td>
                    <td className="py-2 px-3">Straat, huisnummer, postcode, woonplaats</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-3">Projectgegevens</td>
                    <td className="py-2 px-3">Wensen, specificaties, feedback, correspondentie</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">Betalingsgegevens</td>
                    <td className="py-2 px-3">IBAN (bij facturatie), betalingshistorie</td>
                  </tr>
                </tbody>
              </table>

              <h3>2.2 Automatisch verzamelde gegevens</h3>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="text-left py-2 px-3">Categorie</th>
                    <th className="text-left py-2 px-3">Details</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 px-3">IP-adres</td>
                    <td className="py-2 px-3">Geanonimiseerd verwerkt</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-3">Apparaatinformatie</td>
                    <td className="py-2 px-3">Browsertype, besturingssysteem, schermresolutie</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-3">Gebruiksgegevens</td>
                    <td className="py-2 px-3">Bezochte pagina&apos;s, klikgedrag, sessieduur</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">Tijdstempels</td>
                    <td className="py-2 px-3">Datum en tijd van bezoek</td>
                  </tr>
                </tbody>
              </table>

              <h2>3. Doeleinden en rechtsgronden</h2>
              <p>
                Wij verwerken uw persoonsgegevens alleen wanneer wij hiervoor een wettelijke grondslag hebben. 
                De AVG kent zes grondslagen; wij gebruiken er drie:
              </p>

              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="text-left py-2 px-3">Doeleinde</th>
                    <th className="text-left py-2 px-3">Rechtsgrond (Art. 6 AVG)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 px-3">Uitvoeren van de overeenkomst (offerte, project)</td>
                    <td className="py-2 px-3"><strong>Uitvoering overeenkomst</strong> (lid 1 sub b)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-3">Beantwoorden van vragen via contactformulier</td>
                    <td className="py-2 px-3"><strong>Gerechtvaardigd belang</strong> (lid 1 sub f)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-3">Opstellen en verzenden van facturen</td>
                    <td className="py-2 px-3"><strong>Uitvoering overeenkomst</strong> (lid 1 sub b)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-3">Fiscale administratie (7 jaar bewaarplicht)</td>
                    <td className="py-2 px-3"><strong>Wettelijke verplichting</strong> (lid 1 sub c)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-3">Website analytics (geanonimiseerd)</td>
                    <td className="py-2 px-3"><strong>Gerechtvaardigd belang</strong> (lid 1 sub f)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-3">Verzenden van nieuwsbrieven (optioneel)</td>
                    <td className="py-2 px-3"><strong>Toestemming</strong> (lid 1 sub a)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">Betalingsverwerking via Stripe</td>
                    <td className="py-2 px-3"><strong>Uitvoering overeenkomst</strong> (lid 1 sub b)</td>
                  </tr>
                </tbody>
              </table>

              <h2>4. Bewaartermijnen</h2>
              <p>Wij bewaren uw persoonsgegevens niet langer dan noodzakelijk:</p>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="text-left py-2 px-3">Type gegevens</th>
                    <th className="text-left py-2 px-3">Bewaartermijn</th>
                    <th className="text-left py-2 px-3">Reden</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 px-3">Contactformulier aanvragen</td>
                    <td className="py-2 px-3">1 jaar</td>
                    <td className="py-2 px-3">Follow-up</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-3">Offerte aanvragen</td>
                    <td className="py-2 px-3">2 jaar</td>
                    <td className="py-2 px-3">Commercieel belang</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-3">Klantgegevens (projecten)</td>
                    <td className="py-2 px-3">7 jaar na afronding</td>
                    <td className="py-2 px-3">Fiscale bewaarplicht</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-3">Facturen en betalingen</td>
                    <td className="py-2 px-3">7 jaar</td>
                    <td className="py-2 px-3">Fiscale bewaarplicht (AWR)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-3">Website analytics</td>
                    <td className="py-2 px-3">26 maanden</td>
                    <td className="py-2 px-3">Geanonimiseerd</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">Nieuwsbrief gegevens</td>
                    <td className="py-2 px-3">Tot uitschrijving</td>
                    <td className="py-2 px-3">Toestemming</td>
                  </tr>
                </tbody>
              </table>

              <h2>5. Delen met derden (verwerkers)</h2>
              <p>
                Wij delen uw persoonsgegevens <strong>niet</strong> met derden voor hun eigen doeleinden. 
                Wel maken wij gebruik van dienstverleners (verwerkers) die gegevens namens ons verwerken:
              </p>
              
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="text-left py-2 px-3">Verwerker</th>
                    <th className="text-left py-2 px-3">Doel</th>
                    <th className="text-left py-2 px-3">Locatie</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 px-3">Vercel Inc.</td>
                    <td className="py-2 px-3">Website hosting</td>
                    <td className="py-2 px-3">VS (EU-regio beschikbaar)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-3">Stripe Inc.</td>
                    <td className="py-2 px-3">Betalingsverwerking</td>
                    <td className="py-2 px-3">Ierland (EU)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-3">Resend</td>
                    <td className="py-2 px-3">E-mail verzending</td>
                    <td className="py-2 px-3">VS</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-3">Google LLC</td>
                    <td className="py-2 px-3">Analytics (geanonimiseerd)</td>
                    <td className="py-2 px-3">VS (EU-regio)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">Boekhouder</td>
                    <td className="py-2 px-3">Financiële administratie</td>
                    <td className="py-2 px-3">Nederland</td>
                  </tr>
                </tbody>
              </table>

              <p>
                Met alle verwerkers hebben wij een verwerkersovereenkomst gesloten conform artikel 28 AVG. 
                Voor doorgifte naar de VS gelden aanvullende waarborgen (EU-US Data Privacy Framework of 
                Standard Contractual Clauses).
              </p>

              <h2>6. Internationale doorgifte</h2>
              <p>
                Sommige van onze verwerkers zijn gevestigd buiten de Europese Economische Ruimte (EER). 
                In dat geval zorgen wij voor passende waarborgen:
              </p>
              <ul>
                <li><strong>VS:</strong> Adequaatheidsbesluit EU-US Data Privacy Framework, of Standard Contractual Clauses (SCC&apos;s)</li>
                <li><strong>Andere landen:</strong> Alleen met adequaatheidsbesluit of SCC&apos;s</li>
              </ul>

              <h2>7. Uw rechten</h2>
              <p>Op grond van de AVG heeft u de volgende rechten:</p>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="text-left py-2 px-3">Recht</th>
                    <th className="text-left py-2 px-3">Toelichting</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 px-3"><strong>Inzage</strong></td>
                    <td className="py-2 px-3">Recht om te weten welke gegevens wij van u verwerken</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-3"><strong>Rectificatie</strong></td>
                    <td className="py-2 px-3">Recht om onjuiste gegevens te laten corrigeren</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-3"><strong>Verwijdering</strong></td>
                    <td className="py-2 px-3">Recht om uw gegevens te laten wissen (&ldquo;recht op vergetelheid&rdquo;)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-3"><strong>Beperking</strong></td>
                    <td className="py-2 px-3">Recht om verwerking tijdelijk te stoppen</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-3"><strong>Overdraagbaarheid</strong></td>
                    <td className="py-2 px-3">Recht om uw gegevens in een gangbaar formaat te ontvangen</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-3"><strong>Bezwaar</strong></td>
                    <td className="py-2 px-3">Recht om bezwaar te maken tegen verwerking op basis van gerechtvaardigd belang</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3"><strong>Toestemming intrekken</strong></td>
                    <td className="py-2 px-3">Recht om gegeven toestemming op elk moment in te trekken</td>
                  </tr>
                </tbody>
              </table>
              <p>
                Wilt u gebruik maken van deze rechten? Stuur een e-mail naar{" "}
                <a href="mailto:contact@ro-techdevelopment.dev" className="text-indigo-600 hover:underline">
                  contact@ro-techdevelopment.dev
                </a>{" "}
                met een kopie van een geldig identiteitsbewijs (BSN en pasfoto mogen worden afgeschermd). 
                Wij reageren binnen 30 dagen.
              </p>

              <h2>8. Geautomatiseerde besluitvorming</h2>
              <p>
                Wij maken <strong>geen</strong> gebruik van volledig geautomatiseerde besluitvorming of 
                profilering die rechtsgevolgen voor u heeft of u anderszins in aanmerkelijke mate treft.
              </p>

              <h2>9. Minderjarigen</h2>
              <p>
                Onze diensten zijn gericht op zakelijke klanten. Wij verwerken niet bewust persoonsgegevens 
                van personen jonger dan 16 jaar. Indien wij ontdekken dat wij gegevens van een minderjarige 
                hebben ontvangen zonder toestemming van een ouder of voogd, zullen wij deze gegevens 
                onmiddellijk verwijderen.
              </p>

              <h2>10. Beveiliging</h2>
              <p>
                Wij nemen de bescherming van uw gegevens serieus en treffen passende technische en 
                organisatorische maatregelen:
              </p>
              <ul>
                <li>SSL/TLS-encryptie (HTTPS) op alle pagina&apos;s</li>
                <li>Toegangsbeperking tot persoonsgegevens</li>
                <li>Regelmatige back-ups</li>
                <li>Beveiligde hosting (SOC 2 Type II gecertificeerd)</li>
                <li>Tweefactorauthenticatie waar mogelijk</li>
              </ul>

              <h2>11. Cookies</h2>
              <p>
                Onze website maakt gebruik van cookies. Gedetailleerde informatie over welke cookies wij 
                gebruiken en waarvoor vindt u in ons{" "}
                <Link href="/cookiebeleid" className="text-indigo-600 hover:underline">Cookiebeleid</Link>.
              </p>

              <h2>12. Wijzigingen</h2>
              <p>
                Wij kunnen deze privacyverklaring aanpassen bij wijzigingen in wetgeving of ons beleid. 
                De meest recente versie vindt u altijd op deze pagina. Bij significante wijzigingen 
                informeren wij u via e-mail (indien van toepassing) of via een melding op de website.
              </p>

              <h2>13. Klachten</h2>
              <p>
                Heeft u een klacht over de verwerking van uw persoonsgegevens? Wij horen dit graag zodat 
                wij dit kunnen oplossen. Neem contact met ons op via contact@ro-techdevelopment.dev.
              </p>
              <p>
                Komen wij er samen niet uit, dan heeft u het recht een klacht in te dienen bij de 
                toezichthoudende autoriteit:
              </p>
              <p>
                <strong>Autoriteit Persoonsgegevens</strong><br />
                Postbus 93374, 2509 AJ Den Haag<br />
                Telefoon: 0900 - 2001 201<br />
                Website:{" "}
                <a 
                  href="https://autoriteitpersoonsgegevens.nl" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  www.autoriteitpersoonsgegevens.nl
                </a>
              </p>

              <div className="bg-slate-50 p-6 rounded-xl mt-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Contact voor privacy vragen</h3>
                <p className="mb-0">
                  BVR Services (RoTech Development)<br />
                  Kruisstraat 64, 5502 JG Veldhoven<br />
                  E-mail: contact@ro-techdevelopment.dev<br />
                  Telefoon: +31 6 57 23 55 74<br />
                  KvK: 86858173
                </p>
              </div>

              <div className="bg-indigo-50 p-6 rounded-xl mt-6 border border-indigo-100">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Gerelateerde documenten</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/cookiebeleid" className="text-indigo-600 hover:underline">Cookiebeleid</Link>
                  </li>
                  <li>
                    <Link href="/algemene-voorwaarden" className="text-indigo-600 hover:underline">Algemene Voorwaarden</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
