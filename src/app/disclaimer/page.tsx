import { Metadata } from "next";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "Lees onze disclaimer. Informatie over aansprakelijkheid en gebruik van deze website.",
  alternates: {
    canonical: "/disclaimer",
  },
};

export default function DisclaimerPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Disclaimer", url: "/disclaimer" },
        ]}
      />

      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Disclaimer</h1>
            <p className="text-slate-500 mb-8">Laatst bijgewerkt: 14 januari 2026</p>
            
            <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-p:text-slate-600 prose-li:text-slate-600">
              
              <p className="text-lg">
                Deze disclaimer is van toepassing op de website ro-techdevelopment.com, 
                eigendom van BVR Services, handelend onder de naam Ro-Tech Development.
              </p>

              <h2>Informatie op deze website</h2>
              <p>
                De informatie op deze website is met zorg samengesteld. Desondanks kunnen wij 
                niet garanderen dat deze informatie te allen tijde volledig, juist en actueel is.
              </p>
              <p>
                Wij behouden ons het recht voor om de inhoud van de website op elk moment te 
                wijzigen of te verwijderen zonder voorafgaande kennisgeving.
              </p>

              <h2>Geen professioneel advies</h2>
              <p>
                De informatie op deze website is bedoeld als algemene informatie en vormt geen 
                professioneel advies. Voor specifieke vragen over uw situatie raden wij u aan 
                contact met ons op te nemen of een deskundige te raadplegen.
              </p>

              <h2>Prijzen en offertes</h2>
              <p>
                Alle prijzen op deze website zijn indicatief en exclusief BTW, tenzij anders 
                vermeld. Aan genoemde prijzen kunnen geen rechten worden ontleend. De definitieve 
                prijs wordt vastgesteld in een op maat gemaakte offerte.
              </p>

              <h2>Projectvoorbeelden</h2>
              <p>
                De projectvoorbeelden op deze website dienen ter illustratie van onze mogelijkheden. 
                Resultaten kunnen variëren afhankelijk van de specifieke wensen en omstandigheden 
                van elk project.
              </p>

              <h2>Aansprakelijkheid</h2>
              <p>
                Ro-Tech Development is niet aansprakelijk voor:
              </p>
              <ul>
                <li>Schade die voortvloeit uit het gebruik van informatie op deze website</li>
                <li>Schade door onbereikbaarheid of storingen van de website</li>
                <li>Schade door virussen of andere schadelijke componenten</li>
                <li>Inhoud van websites waarnaar wordt gelinkt (externe links)</li>
              </ul>

              <h2>Externe links</h2>
              <p>
                Deze website kan links bevatten naar externe websites. Wij hebben geen invloed 
                op de inhoud van deze websites en zijn niet verantwoordelijk voor de inhoud, 
                het privacybeleid of de praktijken van deze externe sites.
              </p>

              <h2>Intellectueel eigendom</h2>
              <p>
                Alle rechten op de inhoud van deze website (teksten, afbeeldingen, logo&apos;s, 
                ontwerp) berusten bij Ro-Tech Development of de rechtmatige eigenaren. 
                Het is niet toegestaan om zonder schriftelijke toestemming inhoud te kopiëren, 
                verspreiden of anderszins te gebruiken.
              </p>

              <h2>Beschikbaarheid</h2>
              <p>
                Wij streven ernaar de website zo veel mogelijk beschikbaar te houden, maar 
                kunnen geen 100% beschikbaarheid garanderen. Onderhoud, updates of technische 
                problemen kunnen leiden tot tijdelijke onbereikbaarheid.
              </p>

              <h2>Wijzigingen</h2>
              <p>
                Wij behouden ons het recht voor deze disclaimer te allen tijde te wijzigen. 
                De meest recente versie is altijd beschikbaar op deze pagina.
              </p>

              <h2>Toepasselijk recht</h2>
              <p>
                Op deze disclaimer is Nederlands recht van toepassing. Geschillen worden 
                voorgelegd aan de bevoegde rechter in het arrondissement Oost-Brabant.
              </p>

              <div className="bg-slate-50 p-6 rounded-xl mt-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Contact</h3>
                <p className="mb-0">
                  BVR Services (Ro-Tech Development)<br />
                  Kruisstraat 64, 5502 JG Veldhoven<br />
                  E-mail: contact@ro-techdevelopment.com<br />
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
