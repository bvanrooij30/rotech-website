import { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";

export const metadata: Metadata = {
  title: "Algemene Voorwaarden",
  description: "Lees de algemene voorwaarden van RoTech Development. Duidelijke afspraken voor een prettige samenwerking.",
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
            <p className="text-slate-500 mb-8">Laatst bijgewerkt: 21 januari 2026</p>
            
            <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-p:text-slate-600 prose-li:text-slate-600">
              
              <p className="text-lg">
                Deze algemene voorwaarden zijn van toepassing op alle aanbiedingen, offertes en 
                overeenkomsten van BVR Services, handelend onder de naam RoTech Development.
              </p>

              <h2>Artikel 1 – Definities</h2>
              <p>In deze algemene voorwaarden wordt verstaan onder:</p>
              <ul>
                <li><strong>Opdrachtnemer:</strong> BVR Services, handelend onder de naam RoTech Development, gevestigd te Veldhoven, ingeschreven bij de Kamer van Koophandel onder nummer 86858173.</li>
                <li><strong>Opdrachtgever:</strong> De natuurlijke persoon of rechtspersoon die een opdracht verstrekt aan Opdrachtnemer, dan wel met wie Opdrachtnemer een overeenkomst aangaat.</li>
                <li><strong>Consument:</strong> De natuurlijke persoon die niet handelt in de uitoefening van een beroep of bedrijf.</li>
                <li><strong>Overeenkomst:</strong> Iedere afspraak tussen Opdrachtnemer en Opdrachtgever tot het leveren van diensten door Opdrachtnemer.</li>
                <li><strong>Project:</strong> Het geheel van werkzaamheden zoals beschreven in de offerte of overeenkomst.</li>
                <li><strong>Deliverables:</strong> De op te leveren producten zoals website, webshop, applicatie of andere digitale producten.</li>
                <li><strong>Schriftelijk:</strong> Per brief, e-mail of enige andere wijze van communicatie die met het oog op de stand der techniek en de in het maatschappelijk verkeer geldende opvattingen hiermee gelijk kan worden gesteld.</li>
              </ul>

              <h2>Artikel 2 – Toepasselijkheid</h2>
              <ol>
                <li>Deze voorwaarden zijn van toepassing op alle aanbiedingen, offertes, werkzaamheden en overeenkomsten tussen Opdrachtnemer en Opdrachtgever, voor zover van deze voorwaarden niet uitdrukkelijk en schriftelijk is afgeweken.</li>
                <li>Afwijkingen van en aanvullingen op deze voorwaarden zijn slechts geldig indien deze uitdrukkelijk en schriftelijk tussen partijen zijn overeengekomen.</li>
                <li>De toepasselijkheid van eventuele inkoop- of andere voorwaarden van Opdrachtgever wordt uitdrukkelijk van de hand gewezen.</li>
                <li>Indien een of meerdere bepalingen in deze algemene voorwaarden op enig moment geheel of gedeeltelijk nietig zijn of vernietigd worden, blijven de overige bepalingen volledig van toepassing. Partijen zullen alsdan in overleg treden teneinde nieuwe bepalingen ter vervanging overeen te komen, waarbij zoveel mogelijk het doel en de strekking van de oorspronkelijke bepalingen in acht wordt genomen.</li>
                <li>Indien onduidelijkheid bestaat omtrent de uitleg van een of meerdere bepalingen van deze algemene voorwaarden, dan dient de uitleg plaats te vinden naar de geest van deze bepalingen.</li>
              </ol>

              <h2>Artikel 3 – Offertes en Overeenkomsten</h2>
              <ol>
                <li>Alle offertes en aanbiedingen van Opdrachtnemer zijn vrijblijvend en geldig gedurende 30 dagen na dagtekening, tenzij in de offerte een andere termijn is vermeld.</li>
                <li>De in een offerte vermelde prijzen zijn exclusief 21% BTW en andere heffingen van overheidswege, tenzij uitdrukkelijk anders is vermeld.</li>
                <li>Een overeenkomst komt tot stand door:
                  <ul>
                    <li>Schriftelijke acceptatie van de offerte door Opdrachtgever;</li>
                    <li>Digitale acceptatie via het online offerteproces met digitale handtekening;</li>
                    <li>Ondertekening van een contract door beide partijen; of</li>
                    <li>Feitelijke aanvang van de werkzaamheden door Opdrachtnemer na opdrachtverlening.</li>
                  </ul>
                </li>
                <li>Bij digitale acceptatie geldt de digitale handtekening als rechtsgeldige ondertekening overeenkomstig artikel 3:15a BW.</li>
                <li>Mondelinge toezeggingen of afspraken door of met personeelsleden van Opdrachtnemer binden Opdrachtnemer niet dan nadat en voor zover zij door Opdrachtnemer schriftelijk zijn bevestigd.</li>
                <li>De overeenkomst wordt aangegaan voor de duur van het project, tenzij uit de aard van de overeenkomst anders voortvloeit of partijen uitdrukkelijk en schriftelijk anders zijn overeengekomen.</li>
              </ol>

              <h2>Artikel 4 – Uitvoering van de Opdracht</h2>
              <ol>
                <li>Opdrachtnemer zal de overeenkomst naar beste inzicht en vermogen en overeenkomstig de eisen van goed vakmanschap uitvoeren, op grond van de op dat moment bekende stand der wetenschap.</li>
                <li>Opdrachtnemer heeft het recht bepaalde werkzaamheden te laten verrichten door derden, indien dit naar het oordeel van Opdrachtnemer wenselijk is voor een goede uitvoering van de overeenkomst.</li>
                <li>Opdrachtgever draagt er zorg voor dat alle gegevens, teksten, beeldmateriaal en overige informatie waarvan Opdrachtnemer aangeeft dat deze noodzakelijk zijn of waarvan de Opdrachtgever redelijkerwijs behoort te begrijpen dat deze noodzakelijk zijn voor het uitvoeren van de overeenkomst, tijdig aan Opdrachtnemer worden verstrekt.</li>
                <li>Indien de voor de uitvoering van de overeenkomst benodigde gegevens niet tijdig aan Opdrachtnemer zijn verstrekt, heeft Opdrachtnemer het recht de uitvoering van de overeenkomst op te schorten en/of de uit de vertraging voortvloeiende extra kosten volgens de gebruikelijke tarieven aan Opdrachtgever in rekening te brengen.</li>
                <li>Opdrachtnemer is niet aansprakelijk voor schade, van welke aard ook, doordat Opdrachtnemer is uitgegaan van door Opdrachtgever verstrekte onjuiste en/of onvolledige gegevens.</li>
              </ol>

              <h2>Artikel 5 – Levertijd</h2>
              <ol>
                <li>Genoemde levertijden in offertes en overeenkomsten zijn indicatief en gelden nimmer als fatale termijnen, tenzij uitdrukkelijk en schriftelijk anders is overeengekomen.</li>
                <li>De levertijd vangt aan nadat de overeenkomst tot stand is gekomen, Opdrachtnemer alle benodigde gegevens en materialen van Opdrachtgever heeft ontvangen, en de overeengekomen aanbetaling door Opdrachtnemer is ontvangen.</li>
                <li>Bij overschrijding van de levertijd dient Opdrachtgever Opdrachtnemer schriftelijk in gebreke te stellen en een redelijke termijn voor nakoming te gunnen.</li>
                <li>Overschrijding van de levertijd geeft Opdrachtgever geen recht op schadevergoeding, ontbinding of opschorting van enige verplichting, tenzij sprake is van opzet of grove schuld aan de zijde van Opdrachtnemer.</li>
              </ol>

              <h2>Artikel 6 – Betaling</h2>
              <ol>
                <li>Tenzij schriftelijk anders is overeengekomen, gelden de volgende betalingsvoorwaarden:
                  <ul>
                    <li>50% van de totale projectwaarde bij akkoord op de offerte (aanbetaling);</li>
                    <li>50% van de totale projectwaarde bij oplevering van het project.</li>
                  </ul>
                </li>
                <li>Voor projecten met een waarde hoger dan €9.995,- kan een alternatief betalingsschema worden afgesproken:
                  <ul>
                    <li>30% bij akkoord op de offerte;</li>
                    <li>40% bij oplevering van het concept;</li>
                    <li>30% bij definitieve oplevering.</li>
                  </ul>
                </li>
                <li>Betaling dient te geschieden binnen 14 dagen na factuurdatum, op een door Opdrachtnemer aan te geven wijze, in de valuta waarin is gefactureerd, tenzij anders overeengekomen.</li>
                <li>Indien Opdrachtgever in gebreke blijft in de tijdige betaling van een factuur, dan is Opdrachtgever van rechtswege in verzuim. Opdrachtgever is alsdan een rente verschuldigd gelijk aan de wettelijke handelsrente. De rente over het opeisbare bedrag zal worden berekend vanaf het moment dat Opdrachtgever in verzuim is tot het moment van voldoening van het volledig verschuldigde bedrag.</li>
                <li>Na een eerste betalingsherinnering worden administratiekosten van €15,- in rekening gebracht.</li>
                <li>Opdrachtnemer heeft het recht om de werkzaamheden op te schorten of te staken indien facturen niet tijdig worden voldaan.</li>
                <li>In geval van liquidatie, faillissement, beslag of surseance van betaling van Opdrachtgever zijn de vorderingen van Opdrachtnemer op Opdrachtgever onmiddellijk opeisbaar.</li>
              </ol>

              <h2>Artikel 7 – Wijzigingen en Meerwerk</h2>
              <ol>
                <li>Indien tijdens de uitvoering van de overeenkomst blijkt dat voor een behoorlijke uitvoering het noodzakelijk is om de te verrichten werkzaamheden te wijzigen of aan te vullen, zullen partijen tijdig en in onderling overleg de overeenkomst dienovereenkomstig aanpassen.</li>
                <li>Wijzigingen in de oorspronkelijk gesloten overeenkomst die leiden tot meerwerk worden door Opdrachtnemer vooraf schriftelijk aan Opdrachtgever geoffreerd.</li>
                <li>Meerwerk wordt pas uitgevoerd na schriftelijke goedkeuring door Opdrachtgever.</li>
                <li>Kleine aanpassingen die minder dan 30 minuten werk vergen, worden gedurende de looptijd van het project kosteloos uitgevoerd.</li>
                <li>Het uurtarief voor meerwerk bedraagt €90,- exclusief BTW, tenzij schriftelijk anders is overeengekomen.</li>
              </ol>

              <h2>Artikel 7A – Aard van de Dienstverlening</h2>
              <ol>
                <li>Opdrachtnemer is een technisch webontwikkelingsbureau en geen designbureau. Opdrachtnemer werkt met moderne design frameworks, component libraries en templates die worden aangepast aan de huisstijl van Opdrachtgever.</li>
                <li>Voor volledig op maat ontworpen designs (custom design from scratch) door een grafisch ontwerper, kan Opdrachtnemer doorverwijzen naar gespecialiseerde design partners. De kosten hiervan zijn niet inbegrepen in de standaard offertes.</li>
                <li>Opdrachtnemer is geen professionele copywriter. Tekstuele content dient door Opdrachtgever te worden aangeleverd, tenzij schriftelijk anders is overeengekomen.</li>
                <li>Indien Opdrachtnemer content verzorgt, geschiedt dit met behulp van AI-ondersteunde tools. Opdrachtgever is verantwoordelijk voor de controle en goedkeuring van alle content vóór publicatie.</li>
                <li>Opdrachtnemer garandeert geen specifieke zakelijke resultaten zoals omzetstijging, meer klanten of hogere conversie. De effectiviteit van digitale producten is mede afhankelijk van factoren buiten de invloedssfeer van Opdrachtnemer.</li>
              </ol>

              <h2>Artikel 7B – SEO Dienstverlening</h2>
              <ol>
                <li>SEO dienstverlening door Opdrachtnemer richt zich primair op technische SEO optimalisatie, on-page optimalisatie en content structuur.</li>
                <li>Linkbuilding, PR en off-page SEO vallen niet onder de standaard SEO dienstverlening, tenzij uitdrukkelijk en schriftelijk overeengekomen.</li>
                <li>Opdrachtnemer garandeert geen specifieke posities in zoekmachines. Zoekresultaten worden bepaald door algoritmes van zoekmachines waarop Opdrachtnemer geen invloed heeft.</li>
                <li>SEO is een continu proces. Resultaten zijn afhankelijk van vele factoren waaronder concurrentie, zoekvolume, domeinautoriteit en content kwaliteit.</li>
                <li>Wijzigingen in zoekalgoritmes kunnen invloed hebben op behaalde posities. Opdrachtnemer is niet aansprakelijk voor dalingen in zoekresultaten als gevolg van algoritme-updates.</li>
              </ol>

              <h2>Artikel 7C – API Integraties en Koppelingen</h2>
              <ol>
                <li>De mogelijkheid tot het realiseren van API integraties en systeemkoppelingen is afhankelijk van de beschikbaarheid en functionaliteit van API&apos;s van externe systemen.</li>
                <li>Geoffreerde prijzen voor integraties zijn onder voorbehoud van technische haalbaarheid. Na inventarisatie van het betreffende systeem wordt een definitieve prijs vastgesteld.</li>
                <li>Opdrachtnemer is niet aansprakelijk indien integraties niet of beperkt mogelijk blijken door beperkingen in de API van externe systemen, ontbrekende documentatie, of wijzigingen door de leverancier van het externe systeem.</li>
                <li>Indien een integratie technisch niet haalbaar blijkt, worden reeds gemaakte onderzoeks- en ontwikkeluren in rekening gebracht tegen het geldende uurtarief.</li>
                <li>Opdrachtnemer biedt geen garantie op de continuïteit van integraties. Wijzigingen in externe systemen kunnen leiden tot het (tijdelijk) niet functioneren van koppelingen.</li>
              </ol>

              <h2>Artikel 7D – Automatisering en Workflows</h2>
              <ol>
                <li>Automatiseringsdiensten worden geleverd met behulp van tools zoals n8n, Make.com of vergelijkbare platformen.</li>
                <li>De effectiviteit van geautomatiseerde workflows is afhankelijk van de correctheid van aangeleverde data en de beschikbaarheid van gekoppelde systemen.</li>
                <li>Opdrachtgever is verantwoordelijk voor het monitoren van geautomatiseerde processen en het tijdig melden van afwijkingen.</li>
                <li>Opdrachtnemer is niet aansprakelijk voor schade als gevolg van foutief verwerkte data door automatisering, tenzij sprake is van aantoonbare fouten in de door Opdrachtnemer gebouwde workflow.</li>
                <li>Bij zelf-gehoste automatiseringsoplossingen is Opdrachtgever verantwoordelijk voor de serverkosten en beschikbaarheid van de hostingomgeving.</li>
              </ol>

              <h2>Artikel 7E – Content en Materiaal</h2>
              <ol>
                <li>Opdrachtgever is verantwoordelijk voor het tijdig aanleveren van alle benodigde content, waaronder teksten, afbeeldingen, logo&apos;s en overig materiaal.</li>
                <li>Opdrachtgever garandeert dat aangeleverd materiaal geen inbreuk maakt op rechten van derden, waaronder auteursrechten, merkrechten en portretrechten.</li>
                <li>Opdrachtnemer is niet aansprakelijk voor claims van derden met betrekking tot door Opdrachtgever aangeleverd materiaal.</li>
                <li>Indien Opdrachtgever geen afbeeldingen aanlevert, kan Opdrachtnemer gebruik maken van royalty-free stockfoto&apos;s. De keuze en geschiktheid van deze afbeeldingen is ter beoordeling van Opdrachtnemer.</li>
                <li>AI-gegenereerde content en afbeeldingen worden duidelijk als zodanig gemarkeerd en dienen door Opdrachtgever te worden gecontroleerd op feitelijke juistheid vóór publicatie.</li>
              </ol>

              <h2>Artikel 8 – Herroepingsrecht voor Consumenten</h2>
              <ol>
                <li>Dit artikel is uitsluitend van toepassing op Opdrachtgevers die kwalificeren als Consument in de zin van artikel 6:230g BW.</li>
                <li>De Consument heeft het recht om binnen een termijn van 14 dagen zonder opgave van redenen de overeenkomst te herroepen (bedenktijd).</li>
                <li>De bedenktijd gaat in op de dag na het sluiten van de overeenkomst.</li>
                <li>Om het herroepingsrecht uit te oefenen, moet de Consument Opdrachtnemer via een ondubbelzinnige verklaring (bijvoorbeeld schriftelijk per e-mail) op de hoogte stellen van de beslissing de overeenkomst te herroepen. De Consument kan hiervoor gebruik maken van het modelformulier voor herroeping, maar is hiertoe niet verplicht.</li>
                <li>Het herroepingsrecht vervalt indien Opdrachtnemer de dienst volledig heeft verricht binnen de bedenktijd én de Consument uitdrukkelijk voorafgaande toestemming heeft gegeven om met de uitvoering te beginnen, en daarbij heeft verklaard afstand te doen van het herroepingsrecht zodra de overeenkomst volledig is nagekomen.</li>
                <li>Indien de Consument heeft verzocht om de uitvoering van diensten te beginnen tijdens de bedenktijd, is de Consument een evenredig bedrag verschuldigd voor het deel van de verbintenis dat door Opdrachtnemer is nagekomen op het moment van herroeping.</li>
                <li>Meer informatie over het herroepingsrecht is te vinden op de pagina <Link href="/herroepingsrecht" className="text-indigo-600 hover:underline">Herroepingsrecht</Link>.</li>
              </ol>

              <h2>Artikel 9 – Annulering door Opdrachtgever</h2>
              <ol>
                <li>Opdrachtgever kan de overeenkomst te allen tijde schriftelijk opzeggen.</li>
                <li>Bij annulering door Opdrachtgever zijn de volgende annuleringskosten verschuldigd:
                  <ul>
                    <li><strong>Voor aanvang van het project:</strong> 10% van de totale projectwaarde, met een minimum van €150,-;</li>
                    <li><strong>Na goedkeuring van het design:</strong> 35% van de totale projectwaarde, met een minimum van €350,-;</li>
                    <li><strong>Tijdens de ontwikkelfase:</strong> 50% van de totale projectwaarde, vermeerderd met reeds gemaakte uren tegen het geldende uurtarief, met een minimum van €500,-;</li>
                    <li><strong>Na oplevering van het concept:</strong> 75% van de totale projectwaarde, met een minimum van €750,-.</li>
                  </ul>
                </li>
                <li>De annuleringskosten zijn een redelijke vergoeding voor door Opdrachtnemer geleden schade, gederfde winst en gemaakte kosten.</li>
                <li>Reeds verrichte werkzaamheden en gemaakte kosten worden in alle gevallen volledig in rekening gebracht.</li>
                <li>Meer informatie over annulering is te vinden op de pagina <Link href="/annuleringsbeleid" className="text-indigo-600 hover:underline">Annuleringsbeleid</Link>.</li>
              </ol>

              <h2>Artikel 10 – Intellectueel Eigendom</h2>
              <ol>
                <li>Alle rechten van intellectuele eigendom op de krachtens de overeenkomst ontwikkelde of ter beschikking gestelde Deliverables, waaronder software, websites, ontwerpen, documentatie en alle andere materialen, berusten bij Opdrachtnemer.</li>
                <li>Na volledige voldoening van alle door Opdrachtgever verschuldigde bedragen gaat het eigendom van de Deliverables, inclusief broncode, over naar Opdrachtgever, tenzij schriftelijk anders is overeengekomen.</li>
                <li>Tot het moment van volledige betaling is het Opdrachtgever niet toegestaan de Deliverables te gebruiken, te kopiëren, te wijzigen of aan derden ter beschikking te stellen.</li>
                <li>Opdrachtnemer behoudt het recht de Deliverables te gebruiken voor eigen promotie, waaronder portfolio, website, social media en presentaties, tenzij schriftelijk anders is overeengekomen.</li>
                <li>Gebruikte open source software en componenten van derden blijven onderhevig aan de betreffende licenties. Opdrachtnemer verstrekt een overzicht van gebruikte licenties op verzoek.</li>
              </ol>

              <h2>Artikel 11 – Conformiteit en Garantie</h2>
              <ol>
                <li>Opdrachtnemer staat ervoor in dat de Deliverables voldoen aan de overeenkomst, de in de offerte vermelde specificaties en aan redelijke eisen van deugdelijkheid en/of bruikbaarheid.</li>
                <li>Na oplevering geldt een garantieperiode van 30 dagen voor het kosteloos herstellen van gebreken die aantoonbaar het gevolg zijn van ondeugdelijke uitvoering door Opdrachtnemer.</li>
                <li>De garantie omvat niet:
                  <ul>
                    <li>Gebreken die het gevolg zijn van normale slijtage, onoordeelkundig gebruik of gebruik in strijd met de instructies;</li>
                    <li>Wijzigingen of reparaties die door Opdrachtgever of derden zijn uitgevoerd;</li>
                    <li>Gebreken die het gevolg zijn van door Opdrachtgever ter beschikking gestelde materialen;</li>
                    <li>Problemen veroorzaakt door externe factoren zoals hostingproblemen, updates van derden of wijzigingen in wetgeving.</li>
                  </ul>
                </li>
                <li>Na afloop van de garantieperiode worden werkzaamheden verricht op basis van het geldende uurtarief of een onderhoudsabonnement.</li>
                <li>De garantie geldt niet indien Opdrachtgever jegens Opdrachtnemer in gebreke is.</li>
              </ol>

              <h2>Artikel 12 – Klachten</h2>
              <ol>
                <li>Klachten over de verrichte werkzaamheden dienen door Opdrachtgever binnen 14 dagen na ontdekking, doch uiterlijk binnen 30 dagen na voltooiing van de betreffende werkzaamheden schriftelijk te worden gemeld aan Opdrachtnemer.</li>
                <li>De klacht dient een zo gedetailleerd mogelijke omschrijving van de tekortkoming te bevatten, zodat Opdrachtnemer in staat is adequaat te reageren.</li>
                <li>Indien een klacht gegrond is, zal Opdrachtnemer de werkzaamheden alsnog verrichten zoals overeengekomen, tenzij dit inmiddels voor Opdrachtgever aantoonbaar zinloos is geworden.</li>
                <li>Het indienen van een klacht schort de betalingsverplichtingen van Opdrachtgever niet op.</li>
              </ol>

              <h2>Artikel 13 – Aansprakelijkheid</h2>
              <ol>
                <li>Opdrachtnemer is slechts aansprakelijk voor directe schade die het rechtstreekse gevolg is van een toerekenbare tekortkoming in de nakoming van de overeenkomst.</li>
                <li>Opdrachtnemer is niet aansprakelijk voor:
                  <ul>
                    <li>Indirecte schade, waaronder gevolgschade, gederfde winst, gemiste besparingen en schade door bedrijfsstagnatie;</li>
                    <li>Schade die het gevolg is van het verstrekken van onjuiste of onvolledige gegevens door Opdrachtgever;</li>
                    <li>Schade als gevolg van storingen in hosting, internet of diensten van derden;</li>
                    <li>Schade door overmacht of omstandigheden buiten de invloedssfeer van Opdrachtnemer.</li>
                  </ul>
                </li>
                <li>De totale aansprakelijkheid van Opdrachtnemer is beperkt tot het bedrag dat voor het betreffende project in rekening is gebracht, met een maximum van het factuurbedrag exclusief BTW.</li>
                <li>Iedere aansprakelijkheid vervalt door het verloop van twee jaar vanaf het moment dat Opdrachtgever bekend werd of redelijkerwijs bekend kon zijn met het bestaan van de schade.</li>
              </ol>

              <h2>Artikel 14 – Overmacht</h2>
              <ol>
                <li>Opdrachtnemer is niet gehouden tot het nakomen van enige verplichting jegens Opdrachtgever indien hij daartoe gehinderd wordt als gevolg van een omstandigheid die niet is te wijten aan schuld, en noch krachtens de wet, een rechtshandeling of in het verkeer geldende opvattingen voor zijn rekening komt.</li>
                <li>Onder overmacht wordt verstaan, naast hetgeen daaromtrent in de wet en jurisprudentie wordt begrepen: alle van buitenkomende oorzaken, voorzien of niet-voorzien, waarop Opdrachtnemer geen invloed kan uitoefenen, doch waardoor Opdrachtnemer niet in staat is zijn verplichtingen na te komen. Hieronder worden onder meer verstaan: ziekte, stroomuitval, internetstoring, pandemie, overheidsmaatregelen, brand, diefstal, bedrijfsstoring, werkstakingen en oorlog.</li>
                <li>Gedurende de periode van overmacht worden de verplichtingen van Opdrachtnemer opgeschort.</li>
                <li>Indien de periode waarin door overmacht nakoming van de verplichtingen door Opdrachtnemer niet mogelijk is langer duurt dan 60 dagen, zijn beide partijen bevoegd de overeenkomst te ontbinden, zonder dat er in dat geval een verplichting tot schadevergoeding bestaat.</li>
              </ol>

              <h2>Artikel 15 – Geheimhouding</h2>
              <ol>
                <li>Beide partijen zijn verplicht tot geheimhouding van alle vertrouwelijke informatie die zij in het kader van hun overeenkomst van elkaar of uit andere bron hebben verkregen.</li>
                <li>Informatie geldt als vertrouwelijk als dit door de andere partij is medegedeeld of als dit voortvloeit uit de aard van de informatie.</li>
                <li>De verplichting tot geheimhouding blijft ook na beëindiging van de overeenkomst van kracht.</li>
              </ol>

              <h2>Artikel 16 – Beëindiging</h2>
              <ol>
                <li>Beide partijen kunnen de overeenkomst te allen tijde schriftelijk opzeggen.</li>
                <li>Bij beëindiging van de overeenkomst door Opdrachtgever zijn de bepalingen van Artikel 9 (Annulering) van toepassing.</li>
                <li>Opdrachtnemer is gerechtigd de overeenkomst met onmiddellijke ingang, zonder rechterlijke tussenkomst en zonder tot schadevergoeding gehouden te zijn, te beëindigen indien:
                  <ul>
                    <li>Opdrachtgever zijn betalingsverplichtingen niet of niet tijdig nakomt;</li>
                    <li>Opdrachtgever in staat van faillissement is verklaard of surseance van betaling heeft aangevraagd;</li>
                    <li>Opdrachtgever zijn onderneming staakt of liquideert;</li>
                    <li>Opdrachtgever anderszins tekortschiet in de nakoming van zijn verplichtingen.</li>
                  </ul>
                </li>
              </ol>

              <h2>Artikel 17 – Overdracht van Rechten en Verplichtingen</h2>
              <ol>
                <li>Opdrachtgever is niet gerechtigd de rechten en verplichtingen uit de overeenkomst over te dragen aan derden zonder voorafgaande schriftelijke toestemming van Opdrachtnemer.</li>
                <li>Opdrachtnemer is gerechtigd zijn rechten en verplichtingen uit de overeenkomst over te dragen aan een derde, mits dit geen nadelige gevolgen heeft voor de uitvoering van de overeenkomst.</li>
              </ol>

              <h2>Artikel 18 – Wijziging van de Algemene Voorwaarden</h2>
              <ol>
                <li>Opdrachtnemer behoudt zich het recht voor deze algemene voorwaarden te wijzigen of aan te vullen.</li>
                <li>Wijzigingen gelden ook ten aanzien van reeds gesloten overeenkomsten, met inachtneming van een termijn van 30 dagen na schriftelijke bekendmaking van de wijziging.</li>
                <li>Indien Opdrachtgever een wijziging in deze voorwaarden niet wil accepteren, kan hij tot de datum waarop de nieuwe voorwaarden van kracht worden de overeenkomst opzeggen tegen deze datum.</li>
              </ol>

              <h2>Artikel 19 – Toepasselijk Recht en Geschillen</h2>
              <ol>
                <li>Op alle overeenkomsten tussen Opdrachtnemer en Opdrachtgever is uitsluitend Nederlands recht van toepassing.</li>
                <li>Partijen zullen eerst een beroep doen op de rechter nadat zij zich tot het uiterste hebben ingespannen een geschil in onderling overleg te beslechten.</li>
                <li>Alle geschillen die voortvloeien uit of samenhangen met de overeenkomst zullen worden voorgelegd aan de bevoegde rechter in het arrondissement Oost-Brabant, tenzij dwingendrechtelijke bepalingen anders voorschrijven.</li>
                <li>Consumenten kunnen geschillen ook voorleggen aan het Europees platform voor online geschillenbeslechting: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">https://ec.europa.eu/consumers/odr</a>.</li>
              </ol>

              <div className="bg-slate-50 p-6 rounded-xl mt-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Contactgegevens</h3>
                <p className="mb-4">
                  <strong>BVR Services</strong><br />
                  Handelend onder de naam: RoTech Development<br />
                  Kruisstraat 64, 5502 JG Veldhoven<br />
                  E-mail: contact@ro-techdevelopment.dev<br />
                  Telefoon: +31 6 57 23 55 74<br />
                  KvK: 86858173<br />
                  BTW: NL004321198B83
                </p>
              </div>

              <div className="bg-indigo-50 p-6 rounded-xl mt-6 border border-indigo-100">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Gerelateerde documenten</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/privacy" className="text-indigo-600 hover:underline">Privacyverklaring</Link>
                  </li>
                  <li>
                    <Link href="/cookiebeleid" className="text-indigo-600 hover:underline">Cookiebeleid</Link>
                  </li>
                  <li>
                    <Link href="/herroepingsrecht" className="text-indigo-600 hover:underline">Herroepingsrecht</Link>
                  </li>
                  <li>
                    <Link href="/annuleringsbeleid" className="text-indigo-600 hover:underline">Annuleringsbeleid</Link>
                  </li>
                  <li>
                    <Link href="/disclaimer" className="text-indigo-600 hover:underline">Disclaimer</Link>
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
