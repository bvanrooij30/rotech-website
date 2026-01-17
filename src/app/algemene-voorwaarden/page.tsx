import { Metadata } from "next";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";

export const metadata: Metadata = {
  title: "Algemene Voorwaarden",
  description: "Lees de algemene voorwaarden van Ro-Tech Development. Duidelijke afspraken voor een prettige samenwerking.",
  alternates: {
    canonical: "/algemene-voorwaarden",
  },
};

export default function AlgemeneVoorwaardenPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Algemene Voorwaarden", url: "/algemene-voorwaarden" },
        ]}
      />

      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Algemene Voorwaarden</h1>
            <p className="text-slate-500 mb-8">Laatst bijgewerkt: 14 januari 2026</p>
            
            <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-p:text-slate-600 prose-li:text-slate-600">
              
              <p className="text-lg">
                Deze algemene voorwaarden zijn van toepassing op alle aanbiedingen, offertes en 
                overeenkomsten van BVR Services, handelend onder de naam Ro-Tech Development.
              </p>

              <h2>Artikel 1 – Definities</h2>
              <ul>
                <li><strong>Opdrachtnemer:</strong> BVR Services, handelend onder de naam Ro-Tech Development, gevestigd te Veldhoven, KvK 86858173.</li>
                <li><strong>Opdrachtgever:</strong> De natuurlijke of rechtspersoon die een opdracht verstrekt aan Opdrachtnemer.</li>
                <li><strong>Project:</strong> Het geheel van werkzaamheden zoals beschreven in de offerte of overeenkomst.</li>
                <li><strong>Deliverables:</strong> De op te leveren producten zoals website, webshop, applicatie of andere digitale producten.</li>
              </ul>

              <h2>Artikel 2 – Toepasselijkheid</h2>
              <ol>
                <li>Deze voorwaarden zijn van toepassing op alle aanbiedingen, offertes, werkzaamheden en overeenkomsten tussen Opdrachtnemer en Opdrachtgever.</li>
                <li>Afwijkingen zijn alleen geldig indien schriftelijk overeengekomen.</li>
                <li>Eventuele algemene voorwaarden van Opdrachtgever worden uitdrukkelijk van de hand gewezen.</li>
              </ol>

              <h2>Artikel 3 – Offertes en overeenkomsten</h2>
              <ol>
                <li>Alle offertes zijn vrijblijvend en 30 dagen geldig, tenzij anders aangegeven.</li>
                <li>Genoemde prijzen zijn exclusief 21% BTW, tenzij expliciet anders vermeld.</li>
                <li>Een overeenkomst komt tot stand door schriftelijke acceptatie van de offerte, ondertekening van een contract, of feitelijke start van de werkzaamheden.</li>
                <li>Mondelinge afspraken gelden pas na schriftelijke bevestiging.</li>
              </ol>

              <h2>Artikel 4 – Uitvoering van de opdracht</h2>
              <ol>
                <li>Opdrachtnemer voert de opdracht uit naar beste inzicht en vermogen, conform de eisen van goed vakmanschap.</li>
                <li>Opdrachtgever zorgt tijdig voor alle benodigde informatie, teksten, beeldmateriaal en feedback.</li>
                <li>Vertraging door ontbrekende input van Opdrachtgever kan leiden tot verlenging van de levertijd en eventuele meerkosten.</li>
                <li>Opdrachtnemer mag derden inschakelen indien dit de kwaliteit of voortgang ten goede komt.</li>
              </ol>

              <h2>Artikel 5 – Levertijd</h2>
              <ol>
                <li>Genoemde levertijden zijn indicatief en geen fatale termijnen.</li>
                <li>Overschrijding van de levertijd geeft geen recht op schadevergoeding of ontbinding, tenzij sprake is van opzet of grove nalatigheid.</li>
                <li>Bij voorziene vertragingen informeert Opdrachtnemer de Opdrachtgever zo spoedig mogelijk.</li>
              </ol>

              <h2>Artikel 6 – Betaling</h2>
              <ol>
                <li>Tenzij anders overeengekomen, gelden de volgende betalingsvoorwaarden:
                  <ul>
                    <li>40% bij akkoord/start van het project</li>
                    <li>40% bij oplevering</li>
                    <li>20% binnen 14 dagen na oplevering</li>
                  </ul>
                </li>
                <li>Facturen dienen binnen 14 dagen na factuurdatum te worden voldaan.</li>
                <li>Bij niet-tijdige betaling is Opdrachtgever van rechtswege in verzuim. Na een herinnering worden herinneringskosten (€15) en de wettelijke handelsrente in rekening gebracht.</li>
                <li>Opdrachtnemer behoudt het recht werkzaamheden op te schorten bij openstaande facturen.</li>
              </ol>

              <h2>Artikel 7 – Wijzigingen en meerwerk</h2>
              <ol>
                <li>Wijzigingen in de opdracht na akkoord kunnen leiden tot meerwerk.</li>
                <li>Meerwerk wordt vooraf schriftelijk geoffreerd en pas uitgevoerd na akkoord van Opdrachtgever.</li>
                <li>Kleine aanpassingen (&lt; 30 minuten werk) worden kosteloos uitgevoerd gedurende het project.</li>
              </ol>

              <h2>Artikel 8 – Intellectuele eigendom</h2>
              <ol>
                <li>Na volledige betaling gaat het eigendom van de Deliverables (inclusief broncode) over naar Opdrachtgever.</li>
                <li>Tot volledige betaling blijft het eigendom bij Opdrachtnemer.</li>
                <li>Opdrachtnemer behoudt het recht het werk te gebruiken voor portfolio, website en promotiemateriaal, tenzij uitdrukkelijk anders overeengekomen.</li>
                <li>Gebruikte open source software blijft onderhevig aan de betreffende licenties.</li>
              </ol>

              <h2>Artikel 9 – Garantie</h2>
              <ol>
                <li>Na oplevering geldt een garantieperiode van 30 dagen voor het herstellen van bugs en technische fouten die aantoonbaar door Opdrachtnemer zijn veroorzaakt.</li>
                <li>Onder garantie vallen niet:
                  <ul>
                    <li>Wijzigingen of uitbreidingen aan de oorspronkelijke opdracht</li>
                    <li>Problemen veroorzaakt door wijzigingen door Opdrachtgever of derden</li>
                    <li>Problemen door externe factoren (hosting, updates van derden, etc.)</li>
                  </ul>
                </li>
                <li>Na de garantieperiode kunnen werkzaamheden worden verricht op basis van nacalculatie of een onderhoudsabonnement.</li>
              </ol>

              <h2>Artikel 10 – Aansprakelijkheid</h2>
              <ol>
                <li>Opdrachtnemer is niet aansprakelijk voor:
                  <ul>
                    <li>Schade door onjuiste of onvolledige informatie van Opdrachtgever</li>
                    <li>Indirecte schade, gevolgschade of gederfde winst</li>
                    <li>Schade door storingen in hosting, internet of andere externe diensten</li>
                  </ul>
                </li>
                <li>De totale aansprakelijkheid is beperkt tot het bedrag dat voor het betreffende project in rekening is gebracht, met een maximum van het factuurbedrag.</li>
                <li>Claims dienen binnen 2 maanden na ontdekking schriftelijk te worden ingediend.</li>
              </ol>

              <h2>Artikel 11 – Geheimhouding</h2>
              <ol>
                <li>Beide partijen zijn verplicht vertrouwelijke informatie geheim te houden.</li>
                <li>Deze verplichting blijft ook na beëindiging van de overeenkomst van kracht.</li>
              </ol>

              <h2>Artikel 12 – Beëindiging</h2>
              <ol>
                <li>Opdrachtgever kan de overeenkomst opzeggen. Reeds uitgevoerde werkzaamheden worden gefactureerd.</li>
                <li>Bij tussentijdse beëindiging door Opdrachtgever is minimaal het afgesproken voorschot verschuldigd.</li>
                <li>Opdrachtnemer kan de overeenkomst ontbinden bij:
                  <ul>
                    <li>Faillissement of surseance van Opdrachtgever</li>
                    <li>Herhaaldelijk niet-nakomen van verplichtingen door Opdrachtgever</li>
                  </ul>
                </li>
              </ol>

              <h2>Artikel 13 – Overmacht</h2>
              <ol>
                <li>Bij overmacht worden verplichtingen opgeschort zolang de overmacht duurt.</li>
                <li>Onder overmacht vallen o.a.: ziekte, stroomuitval, internetstoring, pandemie, overheidsmaatregelen en andere omstandigheden buiten de macht van Opdrachtnemer.</li>
                <li>Bij overmacht langer dan 60 dagen kunnen beide partijen de overeenkomst ontbinden.</li>
              </ol>

              <h2>Artikel 14 – Toepasselijk recht en geschillen</h2>
              <ol>
                <li>Op alle overeenkomsten is Nederlands recht van toepassing.</li>
                <li>Partijen zullen eerst proberen geschillen in goed overleg op te lossen.</li>
                <li>Geschillen worden voorgelegd aan de bevoegde rechter in het arrondissement Oost-Brabant.</li>
              </ol>

              <div className="bg-slate-50 p-6 rounded-xl mt-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Contact</h3>
                <p className="mb-0">
                  BVR Services (Ro-Tech Development)<br />
                  Kruisstraat 64, 5502 JG Veldhoven<br />
                  E-mail: contact@ro-techdevelopment.dev<br />
                  Telefoon: +31 6 57 23 55 74<br />
                  KvK: 86858173 | BTW: NL004321198B83
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
