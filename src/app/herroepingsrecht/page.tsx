import { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";

export const metadata: Metadata = {
  title: "Herroepingsrecht",
  description: "Informatie over uw herroepingsrecht (bedenktijd van 14 dagen) bij RoTech Development conform de Wet Koop op Afstand.",
  alternates: {
    canonical: "/herroepingsrecht",
  },
};

export default function HerroepingsrechtPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Herroepingsrecht", url: "/herroepingsrecht" },
        ]}
      />

      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Herroepingsrecht</h1>
            <p className="text-slate-500 mb-8">Laatst bijgewerkt: 20 januari 2026</p>
            
            <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-p:text-slate-600 prose-li:text-slate-600">
              
              <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 mb-8">
                <h3 className="text-lg font-semibold text-indigo-900 mb-2 mt-0">Belangrijke informatie</h3>
                <p className="mb-0 text-indigo-800">
                  Als consument heeft u bij een overeenkomst op afstand het recht om binnen 14 dagen 
                  na het sluiten van de overeenkomst deze zonder opgave van redenen te herroepen. 
                  Dit wordt ook wel de &ldquo;bedenktijd&rdquo; genoemd.
                </p>
              </div>

              <h2>Wat is het herroepingsrecht?</h2>
              <p>
                Het herroepingsrecht is een wettelijk recht voor consumenten bij aankopen op afstand 
                (zoals via internet). Dit recht geeft u 14 dagen bedenktijd om af te zien van de 
                overeenkomst, zonder dat u hiervoor een reden hoeft te geven.
              </p>
              <p>
                Dit recht is vastgelegd in de Wet Koop op Afstand (artikelen 6:230o e.v. BW) en 
                de Europese Richtlijn Consumentenrechten.
              </p>

              <h2>Voor wie geldt het herroepingsrecht?</h2>
              <p>
                Het herroepingsrecht geldt uitsluitend voor <strong>consumenten</strong>. Een consument 
                is een natuurlijk persoon die niet handelt in de uitoefening van een beroep of bedrijf.
              </p>
              <p>
                <strong>Zakelijke klanten</strong> (ondernemers, bedrijven, ZZP&apos;ers die handelen 
                in de uitoefening van hun beroep) kunnen geen beroep doen op het herroepingsrecht. 
                Voor hen geldt het <Link href="/annuleringsbeleid" className="text-indigo-600 hover:underline">Annuleringsbeleid</Link>.
              </p>

              <h2>Wanneer gaat de bedenktijd in?</h2>
              <p>
                De bedenktijd van 14 dagen begint op de dag <strong>na</strong> het sluiten van de 
                overeenkomst. Dit is het moment waarop u akkoord gaat met de offerte (via onze website 
                of per e-mail).
              </p>

              <h2>Uitzonderingen op het herroepingsrecht</h2>
              <p>
                Het herroepingsrecht vervalt wanneer wij de dienst volledig hebben uitgevoerd, mits:
              </p>
              <ol>
                <li>
                  De uitvoering is begonnen met uw uitdrukkelijke voorafgaande instemming; én
                </li>
                <li>
                  U heeft verklaard dat u afstand doet van uw herroepingsrecht zodra wij de overeenkomst 
                  volledig zijn nagekomen.
                </li>
              </ol>
              <p>
                Bij onze digitale offerteprocedure wordt u expliciet gevraagd toestemming te geven 
                voor het starten van de werkzaamheden en wordt u geïnformeerd over de gevolgen daarvan 
                voor uw herroepingsrecht.
              </p>

              <h2>Wat als de uitvoering al is begonnen?</h2>
              <p>
                Als u het herroepingsrecht uitoefent nadat u heeft verzocht om met de uitvoering van 
                de dienst te beginnen, bent u een bedrag verschuldigd dat evenredig is aan het deel 
                van de verbintenis dat reeds is nagekomen op het moment van herroeping.
              </p>
              <p>
                Dit bedrag wordt berekend op basis van de totale overeengekomen prijs en de mate 
                waarin de werkzaamheden zijn uitgevoerd.
              </p>

              <h2>Hoe kunt u herroepen?</h2>
              <p>
                Om het herroepingsrecht uit te oefenen, moet u ons via een ondubbelzinnige verklaring 
                op de hoogte stellen van uw beslissing om de overeenkomst te herroepen. U kunt:
              </p>
              <ul>
                <li>
                  Een e-mail sturen naar:{" "}
                  <a href="mailto:contact@ro-techdevelopment.dev" className="text-indigo-600 hover:underline">
                    contact@ro-techdevelopment.dev
                  </a>
                </li>
                <li>Een brief sturen naar ons adres (zie onderaan)</li>
                <li>Gebruik maken van het onderstaande modelformulier</li>
              </ul>

              <h2>Modelformulier voor herroeping</h2>
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <p className="text-sm text-slate-500 mb-4">
                  Dit formulier alleen invullen en terugzenden als u de overeenkomst wilt herroepen.
                </p>
                <div className="bg-white p-4 rounded border border-slate-200">
                  <p>
                    <strong>Aan:</strong><br />
                    BVR Services (RoTech Development)<br />
                    Kruisstraat 64<br />
                    5502 JG Veldhoven<br />
                    E-mail: contact@ro-techdevelopment.dev
                  </p>
                  <p>
                    Ik/Wij (*) deel/delen (*) u hierbij mede dat ik/wij (*) onze overeenkomst 
                    betreffende de volgende dienst herroep/herroepen (*):
                  </p>
                  <p>
                    <em>[Omschrijving van de dienst]</em>
                  </p>
                  <p>
                    Besteld op (*)/Ontvangen op (*): <em>[datum]</em>
                  </p>
                  <p>
                    Naam van de consument(en): <em>[uw naam]</em>
                  </p>
                  <p>
                    Adres van de consument(en): <em>[uw adres]</em>
                  </p>
                  <p>
                    Handtekening van de consument(en): <em>[alleen bij papieren versie]</em>
                  </p>
                  <p>
                    Datum: <em>[datum]</em>
                  </p>
                  <p className="text-sm text-slate-500 mt-4">
                    (*) Doorhalen wat niet van toepassing is.
                  </p>
                </div>
              </div>

              <h2>Wat gebeurt er na herroeping?</h2>
              <ol>
                <li>
                  <strong>Bevestiging:</strong> Wij bevestigen de ontvangst van uw herroeping per e-mail.
                </li>
                <li>
                  <strong>Berekening:</strong> Wij berekenen het evenredig bedrag voor reeds verrichte 
                  werkzaamheden (indien van toepassing).
                </li>
                <li>
                  <strong>Terugbetaling:</strong> Binnen 14 dagen na ontvangst van de herroeping 
                  betalen wij het verschuldigde bedrag terug, minus eventuele kosten voor reeds 
                  verrichte werkzaamheden.
                </li>
                <li>
                  <strong>Terugbetaling methode:</strong> Wij gebruiken hetzelfde betaalmiddel als 
                  u bij de oorspronkelijke transactie heeft gebruikt, tenzij u uitdrukkelijk anders 
                  bent overeengekomen.
                </li>
              </ol>

              <h2>Vragen?</h2>
              <p>
                Heeft u vragen over het herroepingsrecht of wilt u gebruik maken van dit recht? 
                Neem dan contact met ons op. Wij helpen u graag.
              </p>

              <div className="bg-slate-50 p-6 rounded-xl mt-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Contactgegevens</h3>
                <p className="mb-0">
                  BVR Services (RoTech Development)<br />
                  Kruisstraat 64, 5502 JG Veldhoven<br />
                  E-mail: contact@ro-techdevelopment.dev<br />
                  Telefoon: +31 6 57 23 55 74<br />
                  KvK: 86858173
                </p>
              </div>

              <div className="bg-amber-50 p-6 rounded-xl mt-6 border border-amber-200">
                <h3 className="text-lg font-semibold text-amber-900 mb-2">Let op voor zakelijke klanten</h3>
                <p className="mb-0 text-amber-800">
                  Handelt u in de uitoefening van uw beroep of bedrijf? Dan geldt het herroepingsrecht 
                  niet voor u. Bekijk in dat geval ons{" "}
                  <Link href="/annuleringsbeleid" className="text-amber-900 hover:underline font-medium">
                    Annuleringsbeleid
                  </Link>
                  .
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
                    <Link href="/annuleringsbeleid" className="text-indigo-600 hover:underline">
                      Annuleringsbeleid
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
