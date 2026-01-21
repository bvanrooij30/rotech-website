import { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";

export const metadata: Metadata = {
  title: "Annuleringsbeleid",
  description: "Lees ons annuleringsbeleid. Duidelijke informatie over de kosten bij annulering van uw project bij Ro-Tech Development.",
  alternates: {
    canonical: "/annuleringsbeleid",
  },
};

export default function AnnuleringsbeleidPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Annuleringsbeleid", url: "/annuleringsbeleid" },
        ]}
      />

      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Annuleringsbeleid</h1>
            <p className="text-slate-500 mb-8">Laatst bijgewerkt: 20 januari 2026</p>
            
            <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-p:text-slate-600 prose-li:text-slate-600">
              
              <p className="text-lg">
                Wij begrijpen dat omstandigheden kunnen veranderen. Op deze pagina vindt u duidelijke 
                informatie over de kosten die van toepassing zijn wanneer u een project bij Ro-Tech 
                Development wilt annuleren.
              </p>

              <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 mb-8">
                <h3 className="text-lg font-semibold text-indigo-900 mb-2 mt-0">Samenvatting</h3>
                <p className="mb-0 text-indigo-800">
                  De annuleringskosten zijn afhankelijk van de fase waarin het project zich bevindt. 
                  Hoe verder het project gevorderd is, hoe hoger de kosten. Dit is een redelijke 
                  compensatie voor reeds gemaakte kosten, geïnvesteerde tijd en gederfde inkomsten.
                </p>
              </div>

              <h2>Annuleringskosten per projectfase</h2>
              
              <div className="grid gap-4 not-prose">
                {/* Fase 1 */}
                <div className="bg-white border-2 border-slate-200 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="inline-block bg-emerald-100 text-emerald-700 text-sm font-medium px-3 py-1 rounded-full mb-2">
                        Fase 1
                      </span>
                      <h3 className="text-xl font-bold text-slate-900">Voor aanvang van het project</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-emerald-600">10%</span>
                      <p className="text-sm text-slate-500">min. €150</p>
                    </div>
                  </div>
                  <p className="text-slate-600 mb-0">
                    Na akkoord op de offerte, maar voordat wij met de werkzaamheden zijn begonnen. 
                    Dit dekt administratieve kosten, planningsinspanningen en gemiste kansen.
                  </p>
                </div>

                {/* Fase 2 */}
                <div className="bg-white border-2 border-slate-200 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="inline-block bg-amber-100 text-amber-700 text-sm font-medium px-3 py-1 rounded-full mb-2">
                        Fase 2
                      </span>
                      <h3 className="text-xl font-bold text-slate-900">Na goedkeuring van het design</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-amber-600">35%</span>
                      <p className="text-sm text-slate-500">min. €350</p>
                    </div>
                  </div>
                  <p className="text-slate-600 mb-0">
                    Wanneer het design/ontwerp is goedgekeurd en wij de ontwikkeling gaan starten. 
                    Dit dekt ontwerpkosten, onderzoek en voorbereidende werkzaamheden.
                  </p>
                </div>

                {/* Fase 3 */}
                <div className="bg-white border-2 border-orange-200 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="inline-block bg-orange-100 text-orange-700 text-sm font-medium px-3 py-1 rounded-full mb-2">
                        Fase 3
                      </span>
                      <h3 className="text-xl font-bold text-slate-900">Tijdens de ontwikkelfase</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-orange-600">50%</span>
                      <p className="text-sm text-slate-500">min. €500 + uren</p>
                    </div>
                  </div>
                  <p className="text-slate-600 mb-0">
                    Wanneer de technische ontwikkeling is gestart. Naast het basispercentage worden 
                    extra gemaakte uren tegen het geldende uurtarief (€75/uur) in rekening gebracht.
                  </p>
                </div>

                {/* Fase 4 */}
                <div className="bg-white border-2 border-red-200 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="inline-block bg-red-100 text-red-700 text-sm font-medium px-3 py-1 rounded-full mb-2">
                        Fase 4
                      </span>
                      <h3 className="text-xl font-bold text-slate-900">Na oplevering concept</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-red-600">75%</span>
                      <p className="text-sm text-slate-500">min. €750</p>
                    </div>
                  </div>
                  <p className="text-slate-600 mb-0">
                    Wanneer wij een werkend concept/beta-versie hebben opgeleverd voor review. 
                    Het project is dan grotendeels afgerond en alleen afronding en optimalisatie resten.
                  </p>
                </div>
              </div>

              <h2>Waarom annuleringskosten?</h2>
              <p>
                Wanneer u een project bij ons start, reserveren wij capaciteit en wijzen andere 
                potentiële projecten af. De annuleringskosten zijn een redelijke compensatie voor:
              </p>
              <ul>
                <li><strong>Gederfde inkomsten:</strong> Tijd die wij voor u hebben gereserveerd kunnen we niet aan andere klanten besteden.</li>
                <li><strong>Gemaakte kosten:</strong> Onderzoek, ontwerp, planning en administratie die reeds zijn verricht.</li>
                <li><strong>Reeds geleverd werk:</strong> Deliverables die al zijn opgeleverd, zoals ontwerpen of code.</li>
              </ul>

              <h2>Hoe wordt de annulering afgehandeld?</h2>
              <ol>
                <li>
                  <strong>Schriftelijke melding:</strong> U stuurt een e-mail naar{" "}
                  <a href="mailto:contact@ro-techdevelopment.dev" className="text-indigo-600 hover:underline">
                    contact@ro-techdevelopment.dev
                  </a>{" "}
                  met uw verzoek tot annulering.
                </li>
                <li>
                  <strong>Bevestiging:</strong> Wij bevestigen de ontvangst en informeren u over de 
                  van toepassing zijnde annuleringskosten.
                </li>
                <li>
                  <strong>Projectstatus:</strong> Wij bepalen in welke fase het project zich bevindt 
                  en berekenen de kosten.
                </li>
                <li>
                  <strong>Factuur:</strong> U ontvangt een factuur voor de annuleringskosten, minus 
                  eventueel reeds betaalde bedragen.
                </li>
                <li>
                  <strong>Terugbetaling/Betaling:</strong> Afhankelijk van het reeds betaalde bedrag 
                  ontvangt u een terugbetaling of een factuur voor het resterende bedrag.
                </li>
              </ol>

              <h2>Reeds betaalde bedragen</h2>
              <p>
                Bij standaard projecten geldt een betalingsschema van 50% aanbetaling en 50% bij 
                oplevering. Bij annulering wordt de reeds betaalde aanbetaling verrekend met de 
                annuleringskosten:
              </p>
              <ul>
                <li>
                  <strong>Annuleringskosten lager dan aanbetaling:</strong> U ontvangt het verschil 
                  terug binnen 14 dagen.
                </li>
                <li>
                  <strong>Annuleringskosten hoger dan aanbetaling:</strong> U ontvangt een factuur 
                  voor het resterende bedrag, te betalen binnen 14 dagen.
                </li>
              </ul>

              <h2>Voorbeeld berekeningen</h2>
              
              <div className="bg-slate-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Voorbeeld 1: Annulering voor start</h3>
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="py-2">Projectwaarde</td>
                      <td className="py-2 text-right font-medium">€3.000</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-2">Fase</td>
                      <td className="py-2 text-right">Voor aanvang (10%)</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-2">Annuleringskosten</td>
                      <td className="py-2 text-right font-medium">€300</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-2">Reeds betaald (50%)</td>
                      <td className="py-2 text-right">€1.500</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-medium">Terugbetaling</td>
                      <td className="py-2 text-right font-bold text-emerald-600">€1.200</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-slate-50 p-6 rounded-xl mt-4">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Voorbeeld 2: Annulering tijdens ontwikkeling</h3>
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="py-2">Projectwaarde</td>
                      <td className="py-2 text-right font-medium">€3.000</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-2">Fase</td>
                      <td className="py-2 text-right">Tijdens ontwikkeling (50%)</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-2">Extra uren (10 uur × €75)</td>
                      <td className="py-2 text-right">€750</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-2">Annuleringskosten (50% + uren)</td>
                      <td className="py-2 text-right font-medium">€2.250</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-2">Reeds betaald (50%)</td>
                      <td className="py-2 text-right">€1.500</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-medium">Nog te betalen</td>
                      <td className="py-2 text-right font-bold text-red-600">€750</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h2>Uitzonderingen</h2>
              <p>
                In uitzonderlijke omstandigheden (zoals ernstige ziekte of overmacht) kunnen wij 
                in overleg afwijken van dit beleid. Neem in dat geval contact met ons op om de 
                mogelijkheden te bespreken.
              </p>

              <h2>Consumentenrecht</h2>
              <p>
                Dit annuleringsbeleid is primair bedoeld voor zakelijke klanten. Consumenten 
                (particulieren die niet handelen in de uitoefening van een beroep of bedrijf) 
                kunnen daarnaast een beroep doen op het wettelijk{" "}
                <Link href="/herroepingsrecht" className="text-indigo-600 hover:underline">
                  herroepingsrecht
                </Link>{" "}
                van 14 dagen.
              </p>

              <h2>Vragen?</h2>
              <p>
                Heeft u vragen over dit annuleringsbeleid? Neem dan contact met ons op. Wij 
                bespreken graag de mogelijkheden.
              </p>

              <div className="bg-slate-50 p-6 rounded-xl mt-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Contactgegevens</h3>
                <p className="mb-0">
                  BVR Services (Ro-Tech Development)<br />
                  Kruisstraat 64, 5502 JG Veldhoven<br />
                  E-mail: contact@ro-techdevelopment.dev<br />
                  Telefoon: +31 6 57 23 55 74<br />
                  KvK: 86858173
                </p>
              </div>

              <div className="bg-indigo-50 p-6 rounded-xl mt-6 border border-indigo-100">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Gerelateerde documenten</h3>
                <ul className="space-y-2 mb-0">
                  <li>
                    <Link href="/algemene-voorwaarden" className="text-indigo-600 hover:underline">
                      Algemene Voorwaarden
                    </Link>
                  </li>
                  <li>
                    <Link href="/herroepingsrecht" className="text-indigo-600 hover:underline">
                      Herroepingsrecht (voor consumenten)
                    </Link>
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
