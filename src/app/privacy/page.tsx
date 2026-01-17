import { Metadata } from "next";
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
            <p className="text-slate-500 mb-8">Laatst bijgewerkt: 14 januari 2026</p>
            
            <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-p:text-slate-600 prose-li:text-slate-600">
              
              <p className="text-lg">
                BVR Services, handelend onder de naam Ro-Tech Development (&ldquo;wij&rdquo;, &ldquo;ons&rdquo;), 
                hecht grote waarde aan de bescherming van uw persoonsgegevens. In deze privacyverklaring 
                leggen wij uit welke gegevens wij verzamelen, waarom, en hoe wij deze beschermen.
              </p>

              <h2>1. Wie zijn wij?</h2>
              <p>
                <strong>BVR Services</strong><br />
                Handelend onder: Ro-Tech Development<br />
                Adres: Kruisstraat 64, 5502 JG Veldhoven<br />
                KvK-nummer: 86858173<br />
                E-mail: contact@ro-techdevelopment.dev<br />
                Telefoon: +31 6 57 23 55 74
              </p>
              <p>
                Bart van Rooij is de verantwoordelijke voor de gegevensverwerking. Bij vragen over 
                deze privacyverklaring kunt u contact opnemen via bovenstaande gegevens.
              </p>

              <h2>2. Welke gegevens verzamelen wij?</h2>
              <p>Wij verzamelen alleen gegevens die noodzakelijk zijn voor onze dienstverlening:</p>
              
              <h3>Gegevens die u zelf verstrekt:</h3>
              <ul>
                <li>Naam en contactgegevens (e-mail, telefoon)</li>
                <li>Bedrijfsnaam en eventueel KvK-nummer</li>
                <li>Projectwensen en specificaties</li>
                <li>Betalingsgegevens (bij facturatie)</li>
              </ul>

              <h3>Automatisch verzamelde gegevens:</h3>
              <ul>
                <li>IP-adres (geanonimiseerd)</li>
                <li>Browsertype en apparaatinformatie</li>
                <li>Bezochte pagina&apos;s en klikgedrag</li>
                <li>Datum en tijd van bezoek</li>
              </ul>

              <h2>3. Waarom verzamelen wij deze gegevens?</h2>
              <p>Wij gebruiken uw gegevens uitsluitend voor:</p>
              <ul>
                <li><strong>Dienstverlening</strong> – Om uw project uit te voeren en contact met u te onderhouden</li>
                <li><strong>Offertes</strong> – Om u een passend voorstel te kunnen doen</li>
                <li><strong>Facturatie</strong> – Voor administratie en boekhouding</li>
                <li><strong>Website verbetering</strong> – Om onze website te optimaliseren (geanonimiseerd)</li>
                <li><strong>Wettelijke verplichtingen</strong> – Zoals belastingaangiftes</li>
              </ul>
              <p>
                Wij versturen <strong>geen</strong> ongevraagde nieuwsbrieven of marketing e-mails, 
                tenzij u hier expliciet toestemming voor geeft.
              </p>

              <h2>4. Hoe lang bewaren wij uw gegevens?</h2>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Type gegevens</th>
                    <th className="text-left py-2">Bewaartermijn</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">Contactformulier aanvragen</td>
                    <td className="py-2">1 jaar</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Offerte aanvragen</td>
                    <td className="py-2">2 jaar</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Klantgegevens (projecten)</td>
                    <td className="py-2">7 jaar (fiscale bewaarplicht)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Facturen en betalingen</td>
                    <td className="py-2">7 jaar (fiscale bewaarplicht)</td>
                  </tr>
                  <tr>
                    <td className="py-2">Website analytics</td>
                    <td className="py-2">26 maanden (geanonimiseerd)</td>
                  </tr>
                </tbody>
              </table>

              <h2>5. Delen wij uw gegevens met derden?</h2>
              <p>
                Wij delen uw persoonsgegevens <strong>niet</strong> met derden, tenzij dit noodzakelijk 
                is voor onze dienstverlening of wettelijk verplicht is. Denk aan:
              </p>
              <ul>
                <li><strong>Boekhouder</strong> – Voor financiële administratie</li>
                <li><strong>Hostingpartij</strong> – Om uw website te hosten (verwerker)</li>
                <li><strong>Overheid</strong> – Bij wettelijke verplichting (bijv. Belastingdienst)</li>
              </ul>
              <p>
                Met partijen die gegevens voor ons verwerken, sluiten wij een verwerkersovereenkomst 
                om uw privacy te waarborgen.
              </p>

              <h2>6. Uw rechten</h2>
              <p>Op grond van de AVG heeft u de volgende rechten:</p>
              <ul>
                <li><strong>Inzage</strong> – U kunt opvragen welke gegevens wij van u hebben</li>
                <li><strong>Correctie</strong> – U kunt onjuiste gegevens laten aanpassen</li>
                <li><strong>Verwijdering</strong> – U kunt vragen om verwijdering van uw gegevens</li>
                <li><strong>Bezwaar</strong> – U kunt bezwaar maken tegen gegevensverwerking</li>
                <li><strong>Overdracht</strong> – U kunt uw gegevens in een gangbaar formaat ontvangen</li>
              </ul>
              <p>
                Wilt u gebruik maken van deze rechten? Stuur dan een e-mail naar 
                contact@ro-techdevelopment.dev. Wij reageren binnen 30 dagen.
              </p>

              <h2>7. Beveiliging</h2>
              <p>
                Wij nemen de bescherming van uw gegevens serieus. Onze website is beveiligd met 
                SSL-encryptie (https://). Daarnaast nemen wij technische en organisatorische 
                maatregelen om uw gegevens te beschermen tegen onbevoegde toegang.
              </p>

              <h2>8. Cookies</h2>
              <p>
                Onze website gebruikt cookies. Meer informatie vindt u in ons{" "}
                <a href="/cookiebeleid" className="text-indigo-600 hover:underline">Cookiebeleid</a>.
              </p>

              <h2>9. Wijzigingen</h2>
              <p>
                Wij kunnen deze privacyverklaring aanpassen. De meest recente versie vindt u 
                altijd op deze pagina. Bij belangrijke wijzigingen informeren wij u via e-mail 
                (indien van toepassing).
              </p>

              <h2>10. Klachten</h2>
              <p>
                Heeft u een klacht over de verwerking van uw persoonsgegevens? Neem dan contact 
                met ons op. Komen wij er samen niet uit, dan heeft u het recht een klacht in te 
                dienen bij de Autoriteit Persoonsgegevens:{" "}
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
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Contact</h3>
                <p className="mb-0">
                  BVR Services (Ro-Tech Development)<br />
                  Kruisstraat 64, 5502 JG Veldhoven<br />
                  E-mail: contact@ro-techdevelopment.dev<br />
                  Telefoon: +31 6 57 23 55 74<br />
                  KvK: 86858173
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
