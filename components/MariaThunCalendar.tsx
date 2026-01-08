import React, { useState, useEffect } from 'react';

interface CalendarEntry {
    date: string;
    dayType: string;
    recommendations: string[];
    notes: string;
}

interface MariaThunCalendarProps {
    data: CalendarEntry[];
}

const MariaThunCalendar: React.FC<MariaThunCalendarProps> = ({ data }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedEntry, setSelectedEntry] = useState<CalendarEntry | null>(null);
    const [calendarGrid, setCalendarGrid] = useState<any[]>([]);

    useEffect(() => {
        generateCalendarGrid(currentDate);
    }, [currentDate, data]);

    const getDayColor = (dayType: string) => {
        switch (dayType.toLowerCase()) {
            case 'root': return 'bg-[#8B4513] text-white';
            case 'leaf': return 'bg-[#2E8B57] text-white';
            case 'flower': return 'bg-[#FFD700] text-black';
            case 'fruit': return 'bg-[#CD5C5C] text-white';
            default: return 'bg-white text-dark-olive';
        }
    };

    const getTranslateDayType = (dayType: string) => {
        switch (dayType.toLowerCase()) {
            case 'root': return 'Korenina';
            case 'leaf': return 'List';
            case 'flower': return 'Cvet';
            case 'fruit': return 'Plod';
            default: return dayType;
        }
    };

    const generateCalendarGrid = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const daysInMonth = lastDayOfMonth.getDate();
        const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // 0 = Monday

        const grid: any[] = [];

        // Add padding days from previous month
        for (let i = 0; i < startDayOfWeek; i++) {
            grid.push({ isPadding: true });
        }

        // Add days of the current month
        for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const entry = data.find(d => d.date === dateStr);
            grid.push({
                dayNum,
                dateStr,
                entry,
                isPadding: false
            });
        }
        
        // Add padding days for next month to fill grid
        const remainingCells = 42 - grid.length; // 6 rows * 7 days
        for (let i = 0; i < remainingCells; i++) {
            grid.push({ isPadding: true });
        }

        setCalendarGrid(grid);
    };

    const goToPreviousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        setSelectedEntry(null);
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        setSelectedEntry(null);
    };
    
    const monthYearFormat = new Intl.DateTimeFormat('sl-SI', { month: 'long', year: 'numeric' }).format(currentDate);

    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-olive/10">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Calendar Grid */}
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-6">
                        <button onClick={goToPreviousMonth} className="px-3 py-1 bg-cream/60 rounded-md hover:bg-cream transition-colors">&lt; Prejšnji</button>
                        <h3 className="text-2xl font-bold text-dark-olive capitalize">
                            {monthYearFormat}
                        </h3>
                        <button onClick={goToNextMonth} className="px-3 py-1 bg-cream/60 rounded-md hover:bg-cream transition-colors">Naslednji &gt;</button>
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        {['Pon', 'Tor', 'Sre', 'Čet', 'Pet', 'Sob', 'Ned'].map(day => (
                            <div key={day} className="text-center text-xs font-semibold text-olive/60 py-2">{day}</div>
                        ))}

                        {calendarGrid.map((day, index) => (
                            <button
                                key={index}
                                onClick={() => day.entry && setSelectedEntry(day.entry)}
                                disabled={day.isPadding || !day.entry}
                                className={`
                                    aspect-square rounded-lg flex flex-col items-center justify-center transition-all duration-300
                                    ${day.isPadding ? 'bg-cream/50 cursor-default' : (day.entry ? getDayColor(day.entry.dayType) : 'bg-gray-200 text-olive/40 cursor-default')}
                                    ${day.entry ? 'hover:scale-105 hover:shadow-md cursor-pointer' : ''}
                                    ${selectedEntry?.date === day.dateStr && day.entry ? 'ring-2 ring-terracotta ring-offset-2' : ''}
                                `}
                            >
                                <span className="text-sm font-bold">{day.dayNum}</span>
                                {day.entry && (
                                    <span className="text-[10px] hidden sm:block opacity-90 truncate w-full px-1 text-center">
                                        {getTranslateDayType(day.entry.dayType)}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="mt-8 flex flex-wrap gap-4 justify-center">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#8B4513]"></div><span className="text-xs text-olive/80">Korenina</span></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#2E8B57]"></div><span className="text-xs text-olive/80">List</span></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#FFD700]"></div><span className="text-xs text-olive/80">Cvet</span></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#CD5C5C]"></div><span className="text-xs text-olive/80">Plod</span></div>
                    </div>
                </div>

                {/* Selected Day Details */}
                <div className="w-full md:w-72 flex flex-col">
                    <div className={`flex-1 rounded-2xl p-6 border transition-all duration-500 ${selectedEntry ? 'bg-cream/50 border-olive/20' : 'bg-gray-50 border-dashed border-gray-300 flex items-center justify-center text-center'}`}>
                        {selectedEntry ? (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-xl font-bold text-dark-olive">
                                        {new Date(selectedEntry.date).toLocaleDateString('sl-SI', { day: 'numeric', month: 'long' })}
                                    </h4>
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${getDayColor(selectedEntry.dayType)}`}>
                                        {getTranslateDayType(selectedEntry.dayType)}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <h5 className="text-sm font-bold text-terracotta uppercase tracking-wider mb-2">Priporočila</h5>
                                        <ul className="space-y-2">
                                            {selectedEntry.recommendations.map((rec, i) => (
                                                <li key={i} className="flex gap-2 text-sm text-olive/90 leading-relaxed">
                                                    <span className="text-terracotta mt-1">•</span>{rec}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    {selectedEntry.notes && (
                                        <div>
                                            <h5 className="text-sm font-bold text-terracotta uppercase tracking-wider mb-2">Opombe</h5>
                                            <p className="text-sm italic text-olive/70">{selectedEntry.notes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <p className="text-olive/40 italic">Izberite dan za podrobnosti</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MariaThunCalendar;