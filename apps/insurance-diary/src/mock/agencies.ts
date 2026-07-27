export type Agency = {
    id: string
    name: string
    city: string
    temporary?: boolean
}

/** Mock subset — produkcja: baza ~17k KRS/agencji. */
export const AGENCIES: Agency[] = [
    { id: 'a1', name: 'Janusz Sp. z o.o.', city: 'Gdańsk' },
    { id: 'a2', name: 'WorkForce Polska Sp. z o.o.', city: 'Warszawa' },
    { id: 'a3', name: 'Agencja Pracy Tempo', city: 'Poznań' },
    { id: 'a4', name: 'LogiStaff Sp. z o.o.', city: 'Łódź' },
    { id: 'a5', name: 'Baltic Workers Sp. z o.o.', city: 'Gdynia' },
    { id: 'a6', name: 'ProJob Agencja Pracy', city: 'Wrocław' },
    { id: 'a7', name: 'EasyHire Polska', city: 'Kraków' },
    { id: 'a8', name: 'Magazyn Express HR', city: 'Szczecin' },
    { id: 'a9', name: 'Nordic Staffing Sp. z o.o.', city: 'Sopot' },
    { id: 'a10', name: 'Solid Work Agency', city: 'Bydgoszcz' },
    { id: 'a11', name: 'Prime Personnel Sp. z o.o.', city: 'Katowice' },
    { id: 'a12', name: 'Handel & Praca Sp. z o.o.', city: 'Lublin' },
    { id: 'a13', name: 'FreshJob Agencja', city: 'Rzeszów' },
    { id: 'a14', name: 'Atlas Zatrudnienie', city: 'Białystok' },
    { id: 'a15', name: 'Omega HR Solutions', city: 'Toruń' },
    { id: 'a16', name: 'Vistula Workers', city: 'Płock' },
    { id: 'a17', name: 'Cargo People Sp. z o.o.', city: 'Gdańsk' },
    { id: 'a18', name: 'ShiftMate Polska', city: 'Warszawa' },
    { id: 'a19', name: 'Hala Job Center', city: 'Poznań' },
    { id: 'a20', name: 'QuickStaff Sp. z o.o.', city: 'Gliwice' },
]

export function searchAgencies(query: string, extras: Agency[] = []): Agency[] {
    const q = query.trim().toLowerCase()
    if (q.length < 3) return []
    const pool = [...extras, ...AGENCIES]
    return pool
        .filter(
            (a) =>
                a.name.toLowerCase().includes(q) ||
                a.city.toLowerCase().includes(q),
        )
        .slice(0, 12)
}
