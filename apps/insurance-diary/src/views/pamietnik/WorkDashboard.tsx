import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import {
    HiOutlineExclamation,
    HiOutlineLockClosed,
    HiOutlineMenuAlt2,
    HiOutlineShieldCheck,
    HiOutlineShieldExclamation,
    HiOutlineCamera,
    HiOutlineAcademicCap,
} from 'react-icons/hi'
import Button from '@/components/ui/Button'
import Timeline from '@/components/ui/Timeline'
import Avatar from '@/components/ui/Avatar'
import Tag from '@/components/ui/Tag'
import Card from '@/components/ui/Card'
import dayjs from 'dayjs'
import PhoneShell from './PhoneShell'
import BhpGateModal from './BhpGateModal'
import {
    formatShiftClock,
    showLegalCta,
    useInsuranceMockStore,
    type TimelineTile,
} from '@/store/insuranceMockStore'
import classNames from '@/utils/classNames'

const protectionUi = {
    inactive: {
        bar: 'bg-gray-300 text-gray-800',
        icon: <HiOutlineShieldExclamation className="text-xl" />,
        text: 'Brak polisy',
        cta: 'Wykup polisę',
    },
    ready: {
        bar: 'bg-primary text-white',
        icon: <HiOutlineLockClosed className="text-xl" />,
        text: 'Polisa kupiona. Ochrona wystartuje po rozpoczęciu zmiany',
        cta: null as string | null,
    },
    active: {
        bar: 'bg-success text-white animate-pulse',
        icon: <HiOutlineShieldCheck className="text-xl" />,
        text: 'Jesteś chroniony — check-in aktywny',
        cta: null as string | null,
    },
} as const

const colorDot: Record<TimelineTile['color'], string> = {
    green: 'bg-success',
    red: 'bg-error',
    gray: 'bg-gray-400',
    blue: 'bg-primary',
}

const WorkDashboard = () => {
    const navigate = useNavigate()
    const onboardingDone = useInsuranceMockStore((s) => s.onboardingDone)
    const workplaces = useInsuranceMockStore((s) => s.workplaces)
    const workspace = useInsuranceMockStore((s) => s.workspace)
    const setWorkspace = useInsuranceMockStore((s) => s.setWorkspace)
    const policyPurchase = useInsuranceMockStore((s) => s.policyPurchase)
    const getProtectionStatus = useInsuranceMockStore(
        (s) => s.getProtectionStatus,
    )
    const shift = useInsuranceMockStore((s) => s.shift)
    const shiftStartedAt = useInsuranceMockStore((s) => s.shiftStartedAt)
    const timeline = useInsuranceMockStore((s) => s.timeline)
    const tryStartShift = useInsuranceMockStore((s) => s.tryStartShift)
    const startShift = useInsuranceMockStore((s) => s.startShift)
    const endShift = useInsuranceMockStore((s) => s.endShift)
    const needsBhp = useInsuranceMockStore((s) => s.needsBhp)
    const completeBhp = useInsuranceMockStore((s) => s.completeBhp)
    const [clock, setClock] = useState('00h 00m')
    const [bhpOpen, setBhpOpen] = useState(false)
    const [, bump] = useState(0)

    const protection = getProtectionStatus()

    useEffect(() => {
        if (shift !== 'running') {
            setClock('00h 00m')
            return
        }
        const tick = () => setClock(formatShiftClock(shiftStartedAt))
        tick()
        const id = window.setInterval(tick, 1000)
        return () => window.clearInterval(id)
    }, [shift, shiftStartedAt])

    if (!onboardingDone) {
        return <Navigate to="/onboarding/formal" replace />
    }

    if (!workspace && workplaces.length === 0) {
        return <Navigate to="/workspace" replace />
    }

    const p = protectionUi[protection]
    const bhpRequired = needsBhp(workspace?.id)

    const onCheckInClick = () => {
        if (shift === 'running') {
            endShift()
            bump((n) => n + 1)
            return
        }
        const started = tryStartShift()
        if (!started) {
            setBhpOpen(true)
            return
        }
        bump((n) => n + 1)
    }

    const onBhpAccept = () => {
        if (!workspace) return
        completeBhp(workspace.id)
        setBhpOpen(false)
        startShift()
        bump((n) => n + 1)
    }

    return (
        <PhoneShell>
            <div className={classNames('px-4 py-3 flex items-start gap-3', p.bar)}>
                <div className="mt-0.5">{p.icon}</div>
                <div className="flex-1">
                    <div className="text-xs font-semibold uppercase tracking-wide opacity-90">
                        Status ochrony
                    </div>
                    <div className="font-semibold leading-snug">{p.text}</div>
                    {policyPurchase.activeFrom && protection === 'ready' && (
                        <div className="text-xs mt-1 opacity-90">
                            Ochrona od:{' '}
                            {dayjs(policyPurchase.activeFrom).format(
                                'DD.MM.YYYY',
                            )}{' '}
                            (karencja)
                        </div>
                    )}
                    {p.cta && (
                        <Button
                            size="sm"
                            className="mt-2 bg-white text-gray-900 hover:bg-gray-100"
                            onClick={() => navigate('/onboarding/pay')}
                        >
                            {p.cta}
                        </Button>
                    )}
                </div>
                <button
                    type="button"
                    aria-label="Menu"
                    className="p-2 rounded-lg hover:bg-black/10"
                    onClick={() => navigate('/profile')}
                >
                    <HiOutlineMenuAlt2 className="text-2xl" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-28 pt-5">
                <div className="mb-1 text-xs text-gray-500">Miejsce pracy</div>
                {workplaces.length <= 1 ? (
                    <div className="mb-6 font-semibold heading-text rounded-xl border border-gray-200 bg-gray-50 px-3 py-3">
                        {workspace?.name ?? '—'}
                        <span className="block text-sm font-normal text-gray-500">
                            {workspace?.city}
                        </span>
                    </div>
                ) : (
                    <select
                        className="mb-6 w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm font-semibold heading-text outline-none focus:border-primary"
                        value={workspace?.id ?? ''}
                        onChange={(e) => {
                            const next = workplaces.find(
                                (w) => w.id === e.target.value,
                            )
                            if (next) setWorkspace(next)
                        }}
                    >
                        {workplaces.map((w) => (
                            <option key={w.id} value={w.id}>
                                {w.name} ({w.city})
                            </option>
                        ))}
                    </select>
                )}

                <Card className="mb-8 text-center">
                    <h5 className="mb-2">Odbicie na bramce</h5>
                    {bhpRequired && shift !== 'running' && (
                        <p className="text-xs text-warning mb-3">
                            Wymagane szkolenie BHP przed pierwszą zmianą w tym
                            miejscu.
                        </p>
                    )}
                    <Button
                        block
                        size="lg"
                        variant={shift === 'running' ? 'default' : 'solid'}
                        className={classNames(
                            'h-16 text-lg font-semibold',
                            shift === 'running' &&
                                'bg-gray-200 dark:bg-gray-700',
                            bhpRequired &&
                                shift !== 'running' &&
                                'opacity-80',
                        )}
                        onClick={onCheckInClick}
                    >
                        {shift === 'running'
                            ? 'Zakończ pracę'
                            : 'Rozpocznij pracę'}
                    </Button>
                    {shift === 'running' && (
                        <p className="mt-4 text-base font-semibold heading-text">
                            Trwa zmiana: {clock}
                        </p>
                    )}
                    <Button
                        className="mt-3"
                        size="sm"
                        variant="plain"
                        onClick={() => navigate('/workspace')}
                    >
                        Nie widzę firmy — dodaj
                    </Button>
                </Card>

                <h5 className="mb-4">Pamiętnik</h5>
                <p className="text-xs text-gray-500 mb-3">
                    Wpisy chronione PIN-em (ZK symulowane). Dane polisy są
                    osobno — jawne.
                </p>
                {timeline.length === 0 ? (
                    <p className="text-sm text-gray-500">
                        Brak wpisów. Rozpocznij zmianę lub zgłoś zdarzenie.
                    </p>
                ) : (
                    <Timeline>
                        {timeline.map((tile) => (
                            <Timeline.Item
                                key={tile.id}
                                media={
                                    <Avatar
                                        size={25}
                                        shape="circle"
                                        className={classNames(
                                            'text-white',
                                            colorDot[tile.color],
                                        )}
                                    >
                                        {tile.kind === 'incident' ? (
                                            <HiOutlineCamera />
                                        ) : tile.kind === 'bhp_training' ? (
                                            <HiOutlineAcademicCap />
                                        ) : (
                                            tile.label.slice(0, 1)
                                        )}
                                    </Avatar>
                                }
                            >
                                <p className="my-1 flex flex-wrap items-center gap-2">
                                    <span className="font-semibold heading-text">
                                        [{dayjs(tile.ts).format('HH:mm')}]
                                    </span>
                                    <span className="heading-text">
                                        {tile.label}
                                    </span>
                                    {tile.meta?.duration && (
                                        <Tag className="bg-gray-100 dark:bg-gray-800">
                                            Czas: {tile.meta.duration}
                                        </Tag>
                                    )}
                                    {tile.meta?.photo === 'yes' && (
                                        <Tag className="bg-error-subtle text-error">
                                            Zdjęcie
                                        </Tag>
                                    )}
                                    {tile.meta?.voice &&
                                        tile.meta.voice !== 'no' && (
                                            <Tag className="bg-primary-subtle text-primary">
                                                Głos {tile.meta.voice}
                                            </Tag>
                                        )}
                                </p>
                                {showLegalCta(tile) && (
                                    <Button
                                        size="sm"
                                        variant="solid"
                                        className="mt-2"
                                        onClick={() =>
                                            navigate(
                                                `/legal/share?focus=${tile.id}`,
                                            )
                                        }
                                    >
                                        Skonsultuj z prawnikiem / oceń
                                        odszkodowanie
                                    </Button>
                                )}
                            </Timeline.Item>
                        ))}
                    </Timeline>
                )}
            </div>

            <button
                type="button"
                onClick={() => navigate('/report')}
                className="absolute bottom-6 right-5 z-20 flex h-16 w-16 items-center justify-center rounded-full bg-error text-white shadow-lg shadow-error/40 hover:scale-105 active:scale-95 transition-transform"
                aria-label="Zgłoś zdarzenie"
            >
                <HiOutlineExclamation className="text-3xl" />
            </button>

            <BhpGateModal
                isOpen={bhpOpen}
                companyName={workspace?.name ?? 'firmie'}
                onClose={() => setBhpOpen(false)}
                onAccept={onBhpAccept}
            />
        </PhoneShell>
    )
}

export default WorkDashboard
