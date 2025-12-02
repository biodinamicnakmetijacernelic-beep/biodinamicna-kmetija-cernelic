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

                    {/* 1. IMPRESUM */}
                    <section id="impresum" className="scroll-mt-32">
                        <h2 className="font-serif text-2xl text-olive-dark mb-6 pb-4 border-b border-olive/10">1. Podatki o ponudniku (Impresum)</h2>
                        <div className="space-y-4 text-olive/80 leading-relaxed">
                            <p><strong>Naziv:</strong> Biodinamična kmetija Černelič</p>
                            <p><strong>Nosilec kmetije:</strong> Černelič Zvonko</p>
                            <p><strong>Naslov:</strong> Dečno selo 48, 8253 Artiče, Slovenija</p>
                            <p><strong>KMG-MID številka:</strong> 100307183</p>
                            <p><strong>Davčna številka:</strong> [Podatek bo dodan naknadno] (Nismo zavezanci za DDV)</p>
                            <p><strong>Dopolnilna dejavnost:</strong><br />
                                - Prodaja kmetijskih pridelkov (Neposredna prodaja sveže zelenjave in žit)<br />
                                - Izobraževanje na kmetiji (Organizacija delavnic, praks in obiskov skupin)
                            </p>
                            <p><strong>Kontakt:</strong> +386 51 363 447 | ekocernelic@gmail.com</p>
                        </div>
                    </section>

                    {/* 2. POGOJI POSLOVANJA */}
                    <section id="pogoji" className="scroll-mt-32">
                        <h2 className="font-serif text-2xl text-olive-dark mb-6 pb-4 border-b border-olive/10">2. Splošni pogoji poslovanja</h2>
                        <div className="space-y-4 text-olive/80 leading-relaxed">
                            <h3 className="font-bold text-olive">Uvod</h3>
                            <p>Splošni pogoji poslovanja določajo delovanje spletne predstavitve Biodinamične kmetije Černelič, pravice in obveznosti uporabnika ter poslovni odnos med ponudnikom in kupcem.</p>

                            <h3 className="font-bold text-olive mt-6">Ponudba in cene</h3>
                            <p>Zaradi narave pridelave (sezonska nihanja, vremenski vplivi) se ponudba svežih pridelkov dnevno spreminja.</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Vse cene so v evrih (€).</li>
                                <li>DDV ni obračunan na podlagi 1. odstavka 94. člena ZDDV-1 (nismo zavezanci za DDV).</li>
                                <li>Pridržujemo si pravico do spremembe cen brez predhodnega obvestila.</li>
                            </ul>

                            <h3 className="font-bold text-olive mt-6">Postopek naročanja (Oddaja povpraševanja)</h3>
                            <p>Spletna stran omogoča oddajo nezavezujočega povpraševanja.</p>
                            <ol className="list-decimal pl-5 space-y-2">
                                <li>Uporabnik izbere izdelke in jih doda v košarico.</li>
                                <li>S klikom na "Oddaj povpraševanje" uporabnik pošlje seznam želenih izdelkov ponudniku.</li>
                                <li><strong>To dejanje še ne pomeni potrjenega nakupa.</strong></li>
                                <li>Ponudnik preveri dejansko zalogo in kupca kontaktira (prek e-pošte ali telefona) za potrditev naročila, dogovor o točnem znesku (zaradi tehtanja pridelkov) in terminu prevzema/dostave.</li>
                                <li>Pogodba (nakup) je sklenjena šele, ko ponudnik in kupec dokončno potrdita naročilo.</li>
                            </ol>

                            <h3 className="font-bold text-olive mt-6">Plačilo</h3>
                            <p>Omogočamo plačilo z gotovino ob prevzemu (na kmetiji, tržnici ali ob dostavi).</p>

                            <h3 className="font-bold text-olive mt-6">Prevzem in dostava</h3>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Osebni prevzem:</strong> Na naslovu kmetije (Dečno selo 48, 8253 Artiče) po predhodnem dogovoru.</li>
                                <li><strong>Tržnica:</strong> Prevzem možen na tržnici Ljubljana (Pogačarjev trg) v času uradnih ur.</li>
                                <li><strong>Dostava:</strong> Po dogovoru je možna dostava na dom za večja naročila v okolici.</li>
                            </ul>

                            <h3 className="font-bold text-olive mt-6">Reklamacije</h3>
                            <p>Ker gre za hitro pokvarljivo blago (sveže sadje in zelenjava), mora kupec blago pregledati takoj ob prevzemu. Kasnejših reklamacij za sveže pridelke ne upoštevamo, razen v primeru skritih napak.</p>
                        </div>
                    </section>

                    {/* 3. ZASEBNOST */}
                    <section id="zasebnost" className="scroll-mt-32">
                        <h2 className="font-serif text-2xl text-olive-dark mb-6 pb-4 border-b border-olive/10">3. Politika zasebnosti (GDPR)</h2>
                        <div className="space-y-4 text-olive/80 leading-relaxed">
                            <h3 className="font-bold text-olive">Upravljavec podatkov</h3>
                            <p>Upravljavec osebnih podatkov je Biodinamična kmetija Černelič, Dečno selo [ŠT], 8253 Artiče.</p>

                            <h3 className="font-bold text-olive mt-6">Katere podatke zbiramo</h3>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Ob oddaji povpraševanja:</strong> Ime in priimek, e-poštni naslov, telefonska številka, naslov (za potrebe dostave), opombe.</li>
                                <li><strong>Ob prijavi na novice:</strong> E-poštni naslov.</li>
                            </ul>

                            <h3 className="font-bold text-olive mt-6">Namen obdelave</h3>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Izvedba naročila in komunikacija glede dostave/prevzema.</li>
                                <li>Obveščanje o novostih in ponudbi (samo če ste se prijavili na novice).</li>
                            </ul>

                            <h3 className="font-bold text-olive mt-6">Hramba in posredovanje podatkov</h3>
                            <p>Podatke o naročilih hranimo skladno z davčnimi predpisi. Podatke za e-novice hranimo do preklica (odjave). Vaših podatkov ne posredujemo tretjim osebam, razen zunanjim izvajalcem, ki so nujni za delovanje (računovodstvo, gostovanje), s katerimi imamo sklenjene ustrezne pogodbe.</p>

                            <h3 className="font-bold text-olive mt-6">Vaše pravice</h3>
                            <p>Kadarkoli lahko zahtevate vpogled, popravek, izbris ali prenos svojih podatkov. Kontaktirajte nas na ekocernelic@gmail.com.</p>
                        </div>
                    </section>

                    {/* 4. PIŠKOTKI */}
                    <section id="piskotki" className="scroll-mt-32">
                        <h2 className="font-serif text-2xl text-olive-dark mb-6 pb-4 border-b border-olive/10">4. Politika piškotkov</h2>
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
