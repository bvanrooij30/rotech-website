import { Metadata } from "next";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";

export const metadata: Metadata = {
  title: "Cookiebeleid",
  description: "Lees ons cookiebeleid. Transparant over welke cookies wij gebruiken en waarom.",
  alternates: {
    canonical: "/cookiebeleid",
  },
};

export default function CookiebeleidPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Cookiebeleid", url: "/cookiebeleid" },
        ]}
      />

      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Cookiebeleid</h1>
            <p className="text-slate-500 mb-8">Laatst bijgewerkt: 14 januari 2026</p>
            
            <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-p:text-slate-600 prose-li:text-slate-600">
              
              <p className="text-lg">
                Op deze pagina leggen wij uit welke cookies onze website gebruikt en waarom. 
                Wij streven naar minimaal cookiegebruik met respect voor uw privacy.
              </p>

              <h2>Wat zijn cookies?</h2>
              <p>
                Cookies zijn kleine tekstbestanden die op uw apparaat worden opgeslagen wanneer 
                u een website bezoekt. Ze helpen de website goed te functioneren en kunnen 
                informatie verzamelen over uw gebruik van de site.
              </p>

              <h2>Welke cookies gebruiken wij?</h2>
              
              <h3>1. Strikt noodzakelijke cookies</h3>
              <p>
                Deze cookies zijn essentieel voor het functioneren van de website. Zonder deze 
                cookies werkt de website niet correct. U kunt deze niet uitschakelen.
              </p>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="text-left py-2 px-3">Cookie</th>
                    <th className="text-left py-2 px-3">Doel</th>
                    <th className="text-left py-2 px-3">Bewaartermijn</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 px-3">Session ID</td>
                    <td className="py-2 px-3">Formulierbeveiliging</td>
                    <td className="py-2 px-3">Sessie</td>
                  </tr>
                </tbody>
              </table>

              <h3>2. Analytische cookies (optioneel)</h3>
              <p>
                Wij kunnen Google Analytics gebruiken om inzicht te krijgen in het gebruik van 
                onze website. Deze gegevens helpen ons de website te verbeteren.
              </p>
              <ul>
                <li>IP-adressen worden geanonimiseerd</li>
                <li>Gegevens worden niet gedeeld met Google voor advertentiedoeleinden</li>
                <li>Wij hebben een verwerkersovereenkomst met Google</li>
              </ul>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="text-left py-2 px-3">Cookie</th>
                    <th className="text-left py-2 px-3">Doel</th>
                    <th className="text-left py-2 px-3">Bewaartermijn</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 px-3">_ga</td>
                    <td className="py-2 px-3">Onderscheiden bezoekers</td>
                    <td className="py-2 px-3">2 jaar</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-3">_ga_*</td>
                    <td className="py-2 px-3">Sessie persistentie</td>
                    <td className="py-2 px-3">2 jaar</td>
                  </tr>
                </tbody>
              </table>

              <h3>3. Marketing cookies</h3>
              <p>
                <strong>Wij gebruiken geen marketing of tracking cookies.</strong> Wij volgen 
                u niet over andere websites en delen geen gegevens met advertentienetwerken.
              </p>

              <h2>Cookies beheren</h2>
              <p>
                U kunt zelf bepalen of u cookies accepteert. Via uw browserinstellingen kunt u:
              </p>
              <ul>
                <li>Alle cookies blokkeren</li>
                <li>Waarschuwingen ontvangen voordat een cookie wordt geplaatst</li>
                <li>Bestaande cookies verwijderen</li>
              </ul>
              <p>
                Let op: het blokkeren van alle cookies kan invloed hebben op de werking van 
                sommige websites.
              </p>

              <h3>Instructies per browser</h3>
              <ul>
                <li>
                  <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                    Google Chrome
                  </a>
                </li>
                <li>
                  <a href="https://support.mozilla.org/nl/kb/cookies-verwijderen-gegevens-wissen-websites-opgeslagen" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                    Mozilla Firefox
                  </a>
                </li>
                <li>
                  <a href="https://support.apple.com/nl-nl/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                    Safari
                  </a>
                </li>
                <li>
                  <a href="https://support.microsoft.com/nl-nl/microsoft-edge/cookies-verwijderen-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                    Microsoft Edge
                  </a>
                </li>
              </ul>

              <h2>Wijzigingen</h2>
              <p>
                Wij kunnen dit cookiebeleid aanpassen, bijvoorbeeld bij wijzigingen in wetgeving 
                of ons cookiegebruik. De actuele versie vindt u altijd op deze pagina.
              </p>

              <div className="bg-slate-50 p-6 rounded-xl mt-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Vragen?</h3>
                <p className="mb-0">
                  Heeft u vragen over ons cookiebeleid? Neem contact op:<br /><br />
                  BVR Services (Ro-Tech Development)<br />
                  E-mail: contact@ro-techdevelopment.dev<br />
                  Telefoon: +31 6 57 23 55 74
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
