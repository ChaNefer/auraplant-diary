import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Agency } from '@/mock/agencies'

export type ProtectionStatus = 'inactive' | 'ready' | 'active'
export type ShiftStatus = 'idle' | 'running'

export type TimelineKind = 'shift_start' | 'shift_end' | 'incident' | 'note'

export type TimelineTile = {
    id: string
    ts: string
    kind: TimelineKind
    label: string
    color: 'green' | 'red' | 'gray' | 'blue'
    meta?: Record<string, string>
}

export type Policy = {
    id: string
    name: string
    status: 'active' | 'expired'
    validTo: string
}

export type IncidentCategory =
    | 'my_accident'
    | 'near_miss'
    | 'witness'
    | null

type State = {
    pendingPhone: string
    user: {
        firstName: string
        lastName: string
        phone: string
        pesel: string
        address: string
    }
    workspace: Agency | null
    customAgencies: Agency[]
    protection: ProtectionStatus
    shift: ShiftStatus
    shiftStartedAt: string | null
    timeline: TimelineTile[]
    policies: Policy[]
    pendingIncident: IncidentCategory
    pendingPhotoName: string | null
    pendingVoiceSeconds: number
}

type Actions = {
    setPendingPhone: (phone: string) => void
    setUserPhone: (phone: string) => void
    updateUser: (patch: Partial<State['user']>) => void
    setWorkspace: (agency: Agency | null) => void
    addCustomAgency: (name: string, city: string) => Agency
    setProtection: (status: ProtectionStatus) => void
    startShift: () => void
    endShift: () => void
    setPendingIncident: (c: IncidentCategory) => void
    setPendingPhotoName: (name: string | null) => void
    setPendingVoiceSeconds: (n: number) => void
    commitIncident: () => void
    prependTimeline: (tile: Omit<TimelineTile, 'id' | 'ts'> & { ts?: string }) => void
    resetDemo: () => void
}

const seedPolicies: Policy[] = [
    {
        id: 'p1',
        name: 'Pakiet Magazyn Premium',
        status: 'expired',
        validTo: '2026-03-31',
    },
    {
        id: 'p2',
        name: 'Ochrona NNW Hala',
        status: 'active',
        validTo: '2026-12-31',
    },
]

const initialState: State = {
    pendingPhone: '',
    user: {
        firstName: 'Jan',
        lastName: 'Kowalski',
        phone: '',
        pesel: '',
        address: '',
    },
    workspace: null,
    customAgencies: [],
    protection: 'ready',
    shift: 'idle',
    shiftStartedAt: null,
    timeline: [],
    policies: seedPolicies,
    pendingIncident: null,
    pendingPhotoName: null,
    pendingVoiceSeconds: 0,
}

function uid() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function formatDuration(ms: number) {
    const totalMin = Math.floor(ms / 60000)
    const h = Math.floor(totalMin / 60)
    const m = totalMin % 60
    return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`
}

export const useInsuranceMockStore = create<State & Actions>()(
    persist(
        (set, get) => ({
            ...initialState,
            setPendingPhone: (phone) => set({ pendingPhone: phone }),
            setUserPhone: (phone) =>
                set((s) => ({ user: { ...s.user, phone } })),
            updateUser: (patch) =>
                set((s) => ({ user: { ...s.user, ...patch } })),
            setWorkspace: (agency) => set({ workspace: agency }),

            addCustomAgency: (name, city) => {
                const agency: Agency = {
                    id: `tmp-${uid()}`,
                    name,
                    city: city || '—',
                    temporary: true,
                }
                set((s) => ({
                    customAgencies: [agency, ...s.customAgencies],
                    workspace: agency,
                }))
                return agency
            },
            setProtection: (status) => set({ protection: status }),
            startShift: () => {
                const { workspace } = get()
                const startedAt = new Date().toISOString()
                set({
                    shift: 'running',
                    shiftStartedAt: startedAt,
                    protection: 'active',
                })
                get().prependTimeline({
                    kind: 'shift_start',
                    color: 'green',
                    label: `Rozpoczęto zmianę (${workspace?.name ?? '—'})`,
                    ts: startedAt,
                })
            },
            endShift: () => {
                const { workspace, shiftStartedAt } = get()
                const end = new Date()
                const start = shiftStartedAt
                    ? new Date(shiftStartedAt)
                    : end
                const duration = formatDuration(end.getTime() - start.getTime())
                set({
                    shift: 'idle',
                    shiftStartedAt: null,
                    protection: 'ready',
                })
                get().prependTimeline({
                    kind: 'shift_end',
                    color: 'gray',
                    label: `Zakończono zmianę (${workspace?.name ?? '—'})`,
                    meta: { duration },
                    ts: end.toISOString(),
                })
            },
            setPendingIncident: (c) => set({ pendingIncident: c }),
            setPendingPhotoName: (name) => set({ pendingPhotoName: name }),
            setPendingVoiceSeconds: (n) => set({ pendingVoiceSeconds: n }),
            commitIncident: () => {
                const { pendingIncident, pendingPhotoName, pendingVoiceSeconds } =
                    get()
                const labels: Record<Exclude<IncidentCategory, null>, string> = {
                    my_accident: 'Mój wypadek',
                    near_miss: 'Zagrożenie / Near Miss',
                    witness: 'Wypadek kogoś innego',
                }
                if (!pendingIncident) return
                get().prependTimeline({
                    kind: 'incident',
                    color: 'red',
                    label: `Zgłoszono zdarzenie: ${labels[pendingIncident]}`,
                    meta: {
                        photo: pendingPhotoName ? 'yes' : 'no',
                        voice:
                            pendingVoiceSeconds > 0
                                ? `${pendingVoiceSeconds}s`
                                : 'no',
                    },
                })
                set({
                    pendingIncident: null,
                    pendingPhotoName: null,
                    pendingVoiceSeconds: 0,
                })
            },
            prependTimeline: (tile) => {
                const entry: TimelineTile = {
                    id: uid(),
                    ts: tile.ts ?? new Date().toISOString(),
                    kind: tile.kind,
                    label: tile.label,
                    color: tile.color,
                    meta: tile.meta,
                }
                set((s) => ({ timeline: [entry, ...s.timeline] }))
            },
            resetDemo: () => set({ ...initialState }),
        }),
        { name: 'insurance-diary-mock' },
    ),
)

export function formatShiftClock(startedAt: string | null, now = Date.now()) {
    if (!startedAt) return '00h 00m'
    const ms = Math.max(0, now - new Date(startedAt).getTime())
    const totalMin = Math.floor(ms / 60000)
    const h = Math.floor(totalMin / 60)
    const m = totalMin % 60
    return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`
}
