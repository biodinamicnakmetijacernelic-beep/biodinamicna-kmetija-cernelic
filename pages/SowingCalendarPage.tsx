import React, { useState, useEffect } from 'react';
import MariaThunCalendar from '../components/MariaThunCalendar';

interface CalendarEntry {
  date: string;
  dayType: string;
  recommendations: string[];
  notes: string;
}

const SowingCalendarPage: React.FC = () => {
  const [calendarData, setCalendarData] = useState<CalendarEntry[]>([]);
  const [todayEntry, setTodayEntry] = useState<CalendarEntry | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        // Correcting path - in Vite public/data is served from /data/
        const response = await fetch('/data/mariaThunCalendar.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: CalendarEntry[] = await response.json();
        setCalendarData(data);

        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const formattedToday = `${year}-${month}-${day}`;

        const entry = data.find(item => item.date === formattedToday);
        setTodayEntry(entry || null);
      } catch (e: any) {
        setError(e.message);
        console.error("Failed to fetch calendar data:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchCalendarData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-terracotta"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-12 md:py-20">
      <div className="container mx-auto px-4 max-w-5xl">
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-dark-olive mb-6">
            Setveni koledar Marie Thun
          </h1>
          <p className="text-lg text-olive/80 max-w-2xl mx-auto">
            Biodinamični koledar za optimalno načrtovanje opravil na kmetiji.
            Sledite ritmom narave za zdrave rastline in bogat pridelek.
          </p>
        </header>

        <section className="mb-12">
          <div className="bg-white/40 backdrop-blur-md rounded-3xl p-8 mb-12 border border-olive/10 shadow-lg">
            <h2 className="text-2xl font-bold text-dark-olive mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-olive text-white flex items-center justify-center text-sm font-bold">!</span>
              Današnji nasvet ({todayEntry?.date || new Date().toLocaleDateString('sl-SI')})
            </h2>

            {todayEntry ? (
              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-olive font-bold uppercase tracking-wider text-sm">Vrsta dneva:</span>
                    <span className={`px-4 py-1 rounded-full text-sm font-bold 
                      ${todayEntry.dayType.toLowerCase() === 'root' ? 'bg-[#8B4513] text-white' :
                        todayEntry.dayType.toLowerCase() === 'leaf' ? 'bg-[#2E8B57] text-white' :
                          todayEntry.dayType.toLowerCase() === 'flower' ? 'bg-[#FFD700] text-black' :
                            todayEntry.dayType.toLowerCase() === 'fruit' ? 'bg-[#CD5C5C] text-white' : 'bg-olive text-white'}`}>
                      {todayEntry.dayType}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-dark-olive mb-2">Priporočila:</h3>
                    <ul className="list-disc list-inside space-y-1 text-olive/90">
                      {todayEntry.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                {todayEntry.notes && (
                  <div className="bg-white/50 rounded-2xl p-6 border border-olive/5 italic text-olive/80 relative">
                    <span className="absolute -top-3 left-4 bg-terracotta text-white px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest">Opomba</span>
                    {todayEntry.notes}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-olive/60 italic">Za današnji dan ni specifičnih podatkov v koledarju.</p>
            )}
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-dark-olive">Interaktivni pregled</h2>
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium border border-red-100">
                Poti do podatkov ni bilo mogoče najti. Prikazan je testni način.
              </div>
            )}
          </div>

          <MariaThunCalendar data={calendarData} />
        </section>

        <footer className="mt-20 text-center text-olive/40 text-sm italic">
          <p>Podatki temeljijo na metodi Marie Thun za biodinamično kmetovanje.</p>
        </footer>
      </div>
    </div>
  );
};

export default SowingCalendarPage;

