import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const LegalPage: React.FC = () => {
    const { hash } = useLocation();

    useEffect(() => {
        if (hash) {
            const element = document.getElementById(hash.replace('#', ''));
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            window.scrollTo(0, 0);
        }
    }, [hash]);

    return (
        <div className="bg-cream min-h-screen pt-32 pb-20">
            <div className="container mx-auto px-6 max-w-4xl">

                <Link to="/" className="inline-flex items-center gap-2 text-olive/60 hover:text-olive mb-8 transition-colors">
                    <ArrowLeft size={20} />
                    <span className="font-medium">Nazaj na domačo stran</span>
                </Link>

                <h1 className="font-serif text-4xl md:text-5xl text-olive-dark mb-12">Pravna obvestila</h1>

                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-black/5 space-y-16">

                    {/* 1. IMPRESUM & SPLOŠNI POGOJI */}
                    <section id="pogoji" className="scroll-mt-32">
                        <h2 className="font-serif text-2xl text-olive-dark mb-6 pb-4 border-b border-olive/10">1. Splošni pogoji poslovanja</h2>
                        <div className="space-y-6 text-olive/80 leading-relaxed">

                            {/* 1. Splošne določbe */}
                            <div>
                                <h3 className="font-bold text-olive mb-2">1. Splošne določbe in identifikacija ponudnika</h3>
                                <p className="mb-4">Splošni pogoji poslovanja (v nadaljevanju SPP) urejajo razmerje med Ponudnikom (Biodinamična kmetija Černelič), ki deluje kot spletni prodajalec pridelkov, in kupci (potrošniki) na spletni strani <strong>https://www.biodinamicnakmetija-cernelic.si/</strong>.</p>
                                <div className="bg-olive/5 p-4 rounded-xl text-sm">
                                    <p><strong>Ponudnik (Pogodbeni partner):</strong></p>
                                    <ul className="mt-2 space-y-1">
                                        <li><strong>Ime ponudnika:</strong> Biodinamična kmetija Černelič</li>
                                        <li><strong>Nosilec dejavnosti:</strong> Černelič Zvonko</li>
                                        <li><strong>Naslov:</strong> Dečno selo 48, 8253 Artiče</li>
                                        <li><strong>KMG MID:</strong> 100307183</li>
                                        <li><strong>Davčna številka:</strong> [Podatek bo dodan naknadno] (Nismo zavezanci za DDV)</li>
                                        <li><strong>E-pošta:</strong> ekocernelic@gmail.com</li>
                                        <li><strong>Dopolnilna dejavnost na kmetiji:</strong><br />
                                            - Prodaja kmetijskih pridelkov (Neposredna prodaja sveže zelenjave in žit)<br />
                                            - Izobraževanje na kmetiji (Organizacija delavnic, praks in obiskov skupin)
                                        </li>
                                    </ul>
                                </div>
                                <p className="mt-4 text-xs">SPP so sestavljeni v skladu z Zakonom o varstvu potrošnikov (ZVPot-1) in Obligacijskim zakonikom (OZ).</p>
                            </div>

                            {/* 2. Postopek */}
                            <div>
                                <h3 className="font-bold text-olive mb-2">2. Postopek oddaje povpraševanja in sklenitev pogodbe</h3>
                                <p className="mb-2">Spletna stran omogoča nakup v obliki <strong>Oddaje povpraševanja/rezervacije</strong> svežih pridelkov.</p>
                                <ol className="list-decimal pl-5 space-y-2">
                                    <li><strong>Oddaja povpraševanja:</strong> Kupec izbere želene pridelke in s klikom na gumb »ODDAJ POVPRAŠEVANJE« odda povpraševanje, ki velja kot neobvezujoč predlog za sklenitev pogodbe.</li>
                                    <li><strong>Sprejem povpraševanja:</strong> Ponudnik v najkrajšem možnem času (najkasneje v 24 urah) pregleda povpraševanje, preveri razpoložljivost in o njem sprejme odločitev.</li>
                                    <li><strong>Sklenitev pogodbe:</strong> Pogodba med Ponudnikom in kupcem se šteje za sklenjeno šele, ko kupec prejme <strong>Potrditveno e-sporočilo o sprejemu naročila</strong> s strani Ponudnika. Šele s tem potrdilom se Ponudnik zaveže k dobavi pridelkov, Kupec pa k prevzemu in plačilu.</li>
                                </ol>
                            </div>

                            {/* 3. Cene */}
                            <div>
                                <h3 className="font-bold text-olive mb-2">3. Cene in plačilni pogoji</h3>
                                <p>Vse cene so navedene v EUR (€) in veljajo na enoto teže (kg) ali kos.</p>
                                <ul className="list-disc pl-5 space-y-1 mt-2">
                                    <li>Cene so končne (DDV ni obračunan na podlagi 1. odstavka 94. člena ZDDV-1).</li>
                                    <li><strong>Plačilo:</strong> Plačilo se izvede <strong>ob prevzemu pridelkov</strong> (plačilo po povzetju / z gotovino) na dogovorjenem prevzemnem mestu.</li>
                                </ul>
                            </div>

                            {/* 4. Prevzem */}
                            <div>
                                <h3 className="font-bold text-olive mb-2">4. Prevzem in dostava</h3>
                                <p>Ponudnik omogoča naslednje načine prevzema:</p>
                                <ul className="list-disc pl-5 space-y-2 mt-2">
                                    <li><strong>Osebni prevzem na kmetiji:</strong> Na naslovu <strong>Dečno selo 48, 8253 Artiče</strong>, po predhodnem dogovoru in potrditvi s strani Ponudnika.</li>
                                    <li><strong>Prevzem na tržnici:</strong> Prevzem je možen na <strong>Ekološki tržnici Ljubljana, Pogačarjev trg, 1000 Ljubljana</strong>, v uradnih urah tržnice po predhodnem dogovoru in potrditvi s strani Ponudnika.</li>
                                    <li><strong>Prevzem na domu (dostava):</strong> Po dogovoru je možna dostava na dom za večja naročila v okolici.</li>
                                </ul>
                            </div>

                            {/* 5. Odstop */}
                            <div>
                                <h3 className="font-bold text-olive mb-2">5. Odstop od pogodbe in vračila blaga (IZJEMA ZA SVEŽE PRIDELKE)</h3>
                                <p className="mb-2">Kupec z oddajo povpraševanja potrjuje, da je seznanjen s posebnostmi spletne prodaje hitro pokvarljivega blaga.</p>
                                <div className="bg-terracotta/10 p-4 rounded-xl border border-terracotta/20">
                                    <p className="text-sm"><strong>Pravica do odstopa NE VELJA:</strong> V skladu z 5. točko 135. člena Zakona o varstvu potrošnikov (ZVPot-1) <strong>kupec nima pravice do odstopa od pogodbe (v 14 dneh)</strong> pri nakupu blaga, ki je <strong>hitro pokvarljivo ali mu hitro poteče rok uporabe</strong> (sveža zelenjava, sadje, pridelki). S sklenitvijo pogodbe kupec to izjemo potrjuje.</p>
                                </div>
                            </div>

                            {/* 6. Reklamacije */}
                            <div>
                                <h3 className="font-bold text-olive mb-2">6. Stvarna napaka in reklamacije</h3>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Če kupec ob prevzemu ugotovi, da ima pridelek stvarno napako, mora napako <strong>nemudoma</strong> javiti Ponudniku (najkasneje v 24 urah po prevzemu) in priložiti fotografski dokaz.</li>
                                    <li>Ponudnik se zavezuje rešiti utemeljeno reklamacijo.</li>
                                </ul>
                            </div>

                            {/* 7. Spori */}
                            <div>
                                <h3 className="font-bold text-olive mb-2">7. Reševanje sporov</h3>
                                <p>Ponudnik si prizadeva spore reševati sporazumno.</p>
                                <ul className="list-disc pl-5 space-y-1 mt-2 text-sm">
                                    <li><strong>Izvensodno reševanje sporov (IRPS):</strong> Ponudnik ne priznava nobenega izvajalca izvensodnega reševanja potrošniških sporov kot pristojnega za reševanje sporov, ki bi nastali na podlagi teh pogojev.</li>
                                    <li><strong>Platforma SRS:</strong> Skladno z zakonodajo Ponudnik objavlja elektronsko povezavo na platformo za spletno reševanje sporov (SRS): <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-terracotta hover:underline">https://ec.europa.eu/consumers/odr/</a>.</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* 2. ZASEBNOST */}
                    <section id="zasebnost" className="scroll-mt-32">
                        <h2 className="font-serif text-2xl text-olive-dark mb-6 pb-4 border-b border-olive/10">2. Politika zasebnosti in varstvo osebnih podatkov</h2>
                        <div className="space-y-6 text-olive/80 leading-relaxed">
                            <p>Vaša zasebnost je naša prednostna naloga. Z osebnimi podatki ravnamo v skladu z veljavno slovensko in evropsko zakonodajo (GDPR).</p>

                            <div>
                                <h3 className="font-bold text-olive mb-2">1. Upravljavec podatkov</h3>
                                <p>Upravljavec osebnih podatkov (OOD) in odgovorna oseba je:</p>
                                <p className="font-medium mt-1">Biodinamična kmetija Černelič, Nosilec dejavnosti: Černelič Zvonko, Dečno selo 48, 8253 Artiče.</p>
                            </div>

                            <div>
                                <h3 className="font-bold text-olive mb-2">2. Nameni obdelave in pravne podlage</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-olive uppercase bg-olive/5">
                                            <tr>
                                                <th className="px-4 py-2 rounded-tl-lg">Namen obdelave</th>
                                                <th className="px-4 py-2">Kategorije podatkov</th>
                                                <th className="px-4 py-2">Pravna podlaga</th>
                                                <th className="px-4 py-2 rounded-tr-lg">Čas hrambe</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="border-b border-olive/10">
                                                <td className="px-4 py-3 font-medium">Obdelava naročila/rezervacije</td>
                                                <td className="px-4 py-3">Ime, priimek, naslov, e-mail, tel. št.</td>
                                                <td className="px-4 py-3">Izvajanje pogodbe</td>
                                                <td className="px-4 py-3">5 let po izpolnitvi (davčni predpisi)</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-3 font-medium">Pošiljanje e-novic</td>
                                                <td className="px-4 py-3">E-mail naslov</td>
                                                <td className="px-4 py-3">Privolitev</td>
                                                <td className="px-4 py-3">Do preklica (odjave)</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-bold text-olive mb-2">3. Posredovanje podatkov tretjim osebam</h3>
                                <p>Podatki se posredujejo zunanjim obdelovalcem, ki so potrebni za izvedbo storitev:</p>
                                <ul className="list-disc pl-5 space-y-1 mt-2">
                                    <li><strong>Gostovanje:</strong> Netlify, Sanity.io.</li>
                                    <li><strong>Dostava:</strong> Dostavne službe (samo v primeru dostave na dom).</li>
                                    <li><strong>E-mail Marketing:</strong> Ponudnik orodja za pošiljanje e-novic (npr. Mailchimp).</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-bold text-olive mb-2">4. Vaše pravice</h3>
                                <p>Imate pravico do dostopa, popravka, izbrisa (»pravica do pozabe«), ugovora, omejitve obdelave in prenosljivosti podatkov. Vse te pravice lahko uveljavljate s pisno zahtevo na <strong>ekocernelic@gmail.com</strong>.</p>
                            </div>

                            <div>
                                <h3 className="font-bold text-olive mb-2">5. Odjava od e-novic</h3>
                                <p>Od prejemanja e-novic se lahko kadarkoli odjavite s klikom na povezavo »Odjava« v dnu vsakega prejetega e-sporočila.</p>
                            </div>
                        </div>
                    </section>

                    {/* 3. PIŠKOTKI */}
                    <section id="piskotki" className="scroll-mt-32">
                        <h2 className="font-serif text-2xl text-olive-dark mb-6 pb-4 border-b border-olive/10">3. Politika piškotkov</h2>
                        <div className="space-y-4 text-olive/80 leading-relaxed">
                            <p>Ta spletna stran uporablja minimalen nabor piškotkov in lokalne shrambe za svoje delovanje.</p>

                            <h3 className="font-bold text-olive mt-6">Nujni piškotki (Tehnični)</h3>
                            <p>Ti elementi so nujni za pravilno delovanje spletne strani in ne zbirajo osebnih podatkov za namene oglaševanja.</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><code>cartEnabled</code>: Nastavitev prikaza košarice.</li>
                                <li><code>admin_session</code> in <code>sanityToken</code>: Uporabljeno samo za administratorja strani za urejanje vsebine.</li>
                            </ul>

                            <h3 className="font-bold text-olive mt-6">Piškotki tretjih oseb</h3>
                            <p>Naša stran vključuje vdelane videoposnetke s portala <strong>YouTube</strong>. Ko predvajate video, lahko YouTube (Google) na vašo napravo naloži svoje piškotke za analitiko ogledov in preference. Z uporabo video galerije se strinjate z uporabo teh piškotkov.</p>
                            <p>Stran <strong>ne uporablja</strong> piškotkov za sledenje (Google Analytics, Facebook Pixel) ali ciljano oglaševanje.</p>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
};

export default LegalPage;
