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
            <p className="text-slate-500 mb-8">Laatst bijgewerkt: 21 januari 2026</p>
            
            <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-p:text-slate-600 prose-li:text-slate-600">
              
              <p className="text-lg">
                Deze disclaimer is van toepassing op de website ro-techdevelopment.dev, 
                eigendom van BVR Services, handelend onder de naam RoTech Development.
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

              <h2>Aard van onze dienstverlening</h2>
              <p>
                RoTech Development is een <strong>technisch webontwikkelingsbureau</strong>, 
                geen designbureau of reclamebureau. Wij specialiseren ons in het technisch 
                bouwen en ontwikkelen van websites, webshops en web applicaties.
              </p>
              <ul>
                <li>
                  <strong>Design:</strong> Wij werken met moderne design frameworks en component 
                  libraries die wij aanpassen aan uw huisstijl. Voor volledig op maat ontworpen 
                  designs door een grafisch ontwerper verwijzen wij door naar gespecialiseerde partners.
                </li>
                <li>
                  <strong>Content:</strong> Tekstuele content dient door de opdrachtgever te worden 
                  aangeleverd. Indien wij content verzorgen, geschiedt dit met behulp van AI-ondersteunde 
                  tools. De opdrachtgever blijft verantwoordelijk voor controle en goedkeuring.
                </li>
                <li>
                  <strong>Fotografie:</strong> Professionele fotografie is niet inbegrepen. 
                  Wij kunnen gebruik maken van door u aangeleverde beelden of royalty-free stockfoto&apos;s.
                </li>
              </ul>

              <h2>SEO en zoekresultaten</h2>
              <p>
                Onze SEO dienstverlening richt zich op <strong>technische en on-page optimalisatie</strong>. 
                Wij bieden geen garanties voor specifieke posities in zoekmachines.
              </p>
              <ul>
                <li>Zoekresultaten worden bepaald door algoritmes van Google en andere zoekmachines 
                    waarop wij geen invloed hebben.</li>
                <li>Linkbuilding en PR zijn niet standaard inbegrepen in onze SEO diensten.</li>
                <li>SEO resultaten zijn afhankelijk van vele factoren waaronder concurrentie, 
                    zoekvolume en content kwaliteit.</li>
                <li>Wijzigingen in zoekalgoritmes kunnen invloed hebben op behaalde posities.</li>
              </ul>

              <h2>API integraties en koppelingen</h2>
              <p>
                De mogelijkheid tot het realiseren van integraties met externe systemen (zoals 
                boekhoudsoftware, CRM-systemen of andere platforms) is afhankelijk van de 
                beschikbaarheid en functionaliteit van API&apos;s van deze externe partijen.
              </p>
              <ul>
                <li>Prijzen voor integraties zijn onder voorbehoud van technische haalbaarheid.</li>
                <li>Wij zijn niet aansprakelijk indien integraties niet mogelijk blijken door 
                    beperkingen van externe systemen.</li>
                <li>Wijzigingen in externe systemen kunnen leiden tot het niet functioneren 
                    van bestaande koppelingen.</li>
              </ul>

              <h2>Automatisering</h2>
              <p>
                Geautomatiseerde workflows en processen worden gebouwd met tools zoals n8n, 
                Make.com of vergelijkbare platformen. De effectiviteit is afhankelijk van:
              </p>
              <ul>
                <li>De correctheid van aangeleverde data</li>
                <li>De beschikbaarheid van gekoppelde systemen</li>
                <li>Juiste configuratie door de opdrachtgever</li>
              </ul>
              <p>
                De opdrachtgever blijft verantwoordelijk voor het monitoren van geautomatiseerde 
                processen en het controleren van verwerkte data.
              </p>

              <h2>AI-gegenereerde content</h2>
              <p>
                Indien wij AI-tools gebruiken voor het genereren van content (teksten, afbeeldingen):
              </p>
              <ul>
                <li>Dit wordt transparant gecommuniceerd naar de opdrachtgever</li>
                <li>De opdrachtgever is verantwoordelijk voor het controleren op feitelijke juistheid</li>
                <li>AI-gegenereerde content kan fouten of onjuistheden bevatten</li>
                <li>De opdrachtgever dient akkoord te geven vóór publicatie</li>
              </ul>

              <h2>Geen resultaatgarantie</h2>
              <p>
                Wij garanderen geen specifieke zakelijke resultaten zoals:
              </p>
              <ul>
                <li>Omzetstijging of meer verkopen</li>
                <li>Meer bezoekers of klanten</li>
                <li>Hogere conversiepercentages</li>
                <li>Specifieke posities in zoekmachines</li>
                <li>Return on investment (ROI)</li>
              </ul>
              <p>
                De effectiviteit van digitale producten is mede afhankelijk van factoren buiten 
                onze invloedssfeer, waaronder marktomstandigheden, concurrentie, productaanbod, 
                prijsstelling en marketinginspanningen van de opdrachtgever.
              </p>

              <h2>Aansprakelijkheid</h2>
              <p>
                RoTech Development is niet aansprakelijk voor:
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
                ontwerp) berusten bij RoTech Development of de rechtmatige eigenaren. 
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
                  BVR Services (RoTech Development)<br />
                  Kruisstraat 64, 5502 JG Veldhoven<br />
                  E-mail: contact@ro-techdevelopment.dev<br />
                  Telefoon: +31 6 57 23 55 74<br />
                  KvK: 86858173<br />
                  BTW: NL004321198B83
                </p>
              </div>

              <div className="bg-indigo-50 p-6 rounded-xl mt-6 border border-indigo-100">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Gerelateerde documenten</h3>
                <ul className="space-y-2 mb-0">
                  <li>
                    <a href="/algemene-voorwaarden" className="text-indigo-600 hover:underline">
                      Algemene Voorwaarden
                    </a>
                  </li>
                  <li>
                    <a href="/privacy" className="text-indigo-600 hover:underline">
                      Privacyverklaring
                    </a>
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
