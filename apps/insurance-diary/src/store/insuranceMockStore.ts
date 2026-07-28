import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AGENCIES, type Agency } from '@/mock/agencies'

export type ProtectionStatus = 'inactive' | 'ready' | 'active'
export type ShiftStatus = 'idle' | 'running'
export type PolicyPurchaseStatus = 'none' | 'pending' | 'active'

export type TimelineKind =
    | 'shift_start'
    | 'shift_end'
    | 'incident'
    | 'note'
    | 'bhp_training'
    | 'legal_share'

export type TimelineTile = {
    id: string
    ts: string
    kind: TimelineKind
    label: string
    color: 'green' | 'red' | 'gray' | 'blue'
    shareable: boolean
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

export type FormalProfile = {
    firstName: string
    lastName: string
    email: string
    pesel: string
}

export type PolicyPurchase = {
    periodDays: number
    paidAt: string | null
    activeFrom: string | null
    status: PolicyPurchaseStatus
}

export type VaultState = {
    method: 'pin' | 'seed' | null
    unlocked: boolean
    pinMock: string
    seedWords: string[]
    acknowledgedLoss: boolean
}

type State = {
    pendingPhone: string
    onboardingDone: boolean
    formalProfile: FormalProfile
    policyPurchase: PolicyPurchase
    vault: VaultState
    user: {
        firstName: string
        lastName: string
        phone: string
        pesel: string
        address: string
        email: string
    }
    workplaces: Agency[]
    workspace: Agency | null
    customAgencies: Agency[]
    bhpCompletedByWorkplaceId: Record<string, string>
    forceOvertimeLead: boolean
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
    completeFormal: (profile: FormalProfile) => void
    purchasePolicy: (periodDays: number, method: 'blik' | 'apple') => void
    setupVault: (input: {
        method: 'pin' | 'seed'
        pin: string
        seedWords?: string[]
    }) => void
    unlockVault: (pin: string) => boolean
    lockVault: () => void
    setWorkspace: (agency: Agency | null) => void
    selectWorkplace: (agency: Agency) => void
    addCustomAgency: (name: string, city: string) => Agency
    needsBhp: (workplaceId: string | undefined) => boolean
    completeBhp: (workplaceId: string) => void
    /** Returns false if BHP gate required (caller should show modal). */
    tryStartShift: () => boolean
    startShift: () => void
    endShift: () => void
    simulateLongShift: () => void
    setPendingIncident: (c: IncidentCategory) => void
    setPendingPhotoName: (name: string | null) => void
    setPendingVoiceSeconds: (n: number) => void
    commitIncident: () => string | null
    submitLegalShare: (ids: string[], pin: string) => { ok: boolean; message: string }
    prependTimeline: (
        tile: Omit<TimelineTile, 'id' | 'ts' | 'shareable'> & {
            ts?: string
            shareable?: boolean
        },
    ) => string
    getProtectionStatus: () => ProtectionStatus
    resetDemo: () => void
}

const DEMO_WORKPLACES: Agency[] = [AGENCIES[0], AGENCIES[16], AGENCIES[4]]

function tomorrowLocalIso() {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    d.setHours(0, 0, 0, 0)
    return d.toISOString()
}

function addDaysIso(from: Date, days: number) {
    const d = new Date(from)
    d.setDate(d.getDate() + days)
    return d.toISOString().slice(0, 10)
}

const initialState: State = {
    pendingPhone: '',
    onboardingDone: false,
    formalProfile: {
        firstName: '',
        lastName: '',
        email: '',
        pesel: '',
    },
    policyPurchase: {
        periodDays: 0,
        paidAt: null,
        activeFrom: null,
        status: 'none',
    },
    vault: {
        method: null,
        unlocked: false,
        pinMock: '',
        seedWords: [],
        acknowledgedLoss: false,
    },
    user: {
        firstName: '',
        lastName: '',
        phone: '',
        pesel: '',
        address: '',
        email: '',
    },
    workplaces: [],
    workspace: null,
    customAgencies: [],
    bhpCompletedByWorkplaceId: {},
    forceOvertimeLead: false,
    shift: 'idle',
    shiftStartedAt: null,
    timeline: [],
    policies: [],
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

function durationHours(ms: number) {
    return ms / 3600000
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

            completeFormal: (profile) =>
                set((s) => ({
                    formalProfile: profile,
                    user: {
                        ...s.user,
                        firstName: profile.firstName,
                        lastName: profile.lastName,
                        email: profile.email,
                        pesel: profile.pesel,
                    },
                })),

            purchasePolicy: (periodDays, _method) => {
                void _method
                const paidAt = new Date().toISOString()
                const activeFrom = tomorrowLocalIso()
                const validTo = addDaysIso(new Date(activeFrom), periodDays)
                set({
                    policyPurchase: {
                        periodDays,
                        paidAt,
                        activeFrom,
                        status: 'pending',
                    },
                    policies: [
                        {
                            id: `pol-${uid()}`,
                            name: `Pakiet Ochrona Hala (${periodDays} dni)`,
                            status: 'active',
                            validTo,
                        },
                    ],
                    workplaces: DEMO_WORKPLACES,
                    workspace: DEMO_WORKPLACES[0],
                })
            },

            setupVault: ({ method, pin, seedWords }) => {
                set({
                    vault: {
                        method,
                        unlocked: true,
                        pinMock: pin,
                        seedWords: seedWords ?? [],
                        acknowledgedLoss: true,
                    },
                    onboardingDone: true,
                })
            },

            unlockVault: (pin) => {
                const { vault } = get()
                if (pin === vault.pinMock) {
                    set({ vault: { ...vault, unlocked: true } })
                    return true
                }
                return false
            },

            lockVault: () =>
                set((s) => ({ vault: { ...s.vault, unlocked: false } })),

            setWorkspace: (agency) => set({ workspace: agency }),

            selectWorkplace: (agency) =>
                set((s) => ({
                    workspace: agency,
                    workplaces: s.workplaces.some((w) => w.id === agency.id)
                        ? s.workplaces
                        : [agency, ...s.workplaces],
                })),

            addCustomAgency: (name, city) => {
                const agency: Agency = {
                    id: `tmp-${uid()}`,
                    name,
                    city: city || '—',
                    temporary: true,
                }
                set((s) => ({
                    customAgencies: [agency, ...s.customAgencies],
                    workplaces: [agency, ...s.workplaces],
                    workspace: agency,
                }))
                return agency
            },

            needsBhp: (workplaceId) => {
                if (!workplaceId) return false
                return !get().bhpCompletedByWorkplaceId[workplaceId]
            },

            completeBhp: (workplaceId) => {
                const { workspace } = get()
                const ts = new Date().toISOString()
                set((s) => ({
                    bhpCompletedByWorkplaceId: {
                        ...s.bhpCompletedByWorkplaceId,
                        [workplaceId]: ts,
                    },
                }))
                get().prependTimeline({
                    kind: 'bhp_training',
                    color: 'blue',
                    label: `Ukończono cyfrowe szkolenie BHP (${workspace?.name ?? '—'})`,
                    shareable: true,
                    ts,
                    meta: { workplaceId },
                })
            },

            tryStartShift: () => {
                const { workspace } = get()
                if (!workspace) return false
                if (get().needsBhp(workspace.id)) return false
                get().startShift()
                return true
            },

            startShift: () => {
                const { workspace } = get()
                const startedAt = new Date().toISOString()
                set({
                    shift: 'running',
                    shiftStartedAt: startedAt,
                })
                get().prependTimeline({
                    kind: 'shift_start',
                    color: 'green',
                    label: `Rozpoczęto zmianę (${workspace?.name ?? '—'})`,
                    shareable: true,
                    ts: startedAt,
                })
            },

            endShift: () => {
                const { workspace, shiftStartedAt, forceOvertimeLead } = get()
                const end = new Date()
                const start = shiftStartedAt ? new Date(shiftStartedAt) : end
                let ms = end.getTime() - start.getTime()
                if (forceOvertimeLead) {
                    ms = Math.max(ms, 14 * 3600000)
                }
                const duration = formatDuration(ms)
                const hours = durationHours(ms)
                set({
                    shift: 'idle',
                    shiftStartedAt: null,
                    forceOvertimeLead: false,
                })
                get().prependTimeline({
                    kind: 'shift_end',
                    color: 'gray',
                    label: `Zakończono zmianę (${workspace?.name ?? '—'})`,
                    shareable: true,
                    meta: {
                        duration,
                        hours: String(hours.toFixed(1)),
                        overtime: hours >= 10 ? 'yes' : 'no',
                    },
                    ts: end.toISOString(),
                })
            },

            simulateLongShift: () => {
                set({ forceOvertimeLead: true })
                const ok = get().tryStartShift()
                if (!ok) {
                    /* BHP gate — still mark flag; after BHP auto-start uses flag */
                    return
                }
            },

            setPendingIncident: (c) => set({ pendingIncident: c }),
            setPendingPhotoName: (name) => set({ pendingPhotoName: name }),
            setPendingVoiceSeconds: (n) => set({ pendingVoiceSeconds: n }),

            commitIncident: () => {
                const {
                    pendingIncident,
                    pendingPhotoName,
                    pendingVoiceSeconds,
                } = get()
                const labels: Record<
                    Exclude<IncidentCategory, null>,
                    string
                > = {
                    my_accident: 'Mój wypadek',
                    near_miss: 'Zagrożenie / Near Miss',
                    witness: 'Wypadek kogoś innego',
                }
                if (!pendingIncident) return null
                const id = get().prependTimeline({
                    kind: 'incident',
                    color: 'red',
                    label: `Zgłoszono zdarzenie: ${labels[pendingIncident]}`,
                    shareable: true,
                    meta: {
                        photo: pendingPhotoName ? 'yes' : 'no',
                        voice:
                            pendingVoiceSeconds > 0
                                ? `${pendingVoiceSeconds}s`
                                : 'no',
                        category: pendingIncident,
                    },
                })
                set({
                    pendingIncident: null,
                    pendingPhotoName: null,
                    pendingVoiceSeconds: 0,
                })
                return id
            },

            submitLegalShare: (ids, pin) => {
                const { vault, formalProfile } = get()
                if (pin !== vault.pinMock) {
                    return { ok: false, message: 'Nieprawidłowy PIN' }
                }
                if (ids.length === 0) {
                    return { ok: false, message: 'Zaznacz co najmniej jeden wpis' }
                }
                get().prependTimeline({
                    kind: 'legal_share',
                    color: 'blue',
                    label: `Udostępniono ${ids.length} dowod(ów) do analizy prawnej (Żylet)`,
                    shareable: false,
                    meta: {
                        count: String(ids.length),
                        email: formalProfile.email,
                        name: `${formalProfile.firstName} ${formalProfile.lastName}`,
                    },
                })
                return { ok: true, message: 'Paczka wysłana do panelu CRM Żylet' }
            },

            prependTimeline: (tile) => {
                const id = uid()
                const entry: TimelineTile = {
                    id,
                    ts: tile.ts ?? new Date().toISOString(),
                    kind: tile.kind,
                    label: tile.label,
                    color: tile.color,
                    shareable: tile.shareable ?? true,
                    meta: tile.meta,
                }
                set((s) => ({ timeline: [entry, ...s.timeline] }))
                return id
            },

            getProtectionStatus: () => {
                const { policyPurchase, shift } = get()
                if (policyPurchase.status === 'none') return 'inactive'
                if (shift === 'running') return 'active'
                return 'ready'
            },

            resetDemo: () => set({ ...initialState }),
        }),
        { name: 'insurance-diary-mock-v2' },
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

export function showLegalCta(tile: TimelineTile): boolean {
    if (tile.kind === 'incident') return true
    if (tile.kind === 'shift_end' && tile.meta?.overtime === 'yes') return true
    return false
}
