import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import {
    HiOutlineExclamation,
    HiOutlineLockClosed,
    HiOutlineMenuAlt2,
    HiOutlineShieldCheck,
    HiOutlineShieldExclamation,
    HiOutlineCamera,
} from 'react-icons/hi'
import Button from '@/components/ui/Button'
import Timeline from '@/components/ui/Timeline'
import Avatar from '@/components/ui/Avatar'
import Tag from '@/components/ui/Tag'
import Card from '@/components/ui/Card'
import dayjs from 'dayjs'
import PhoneShell from './PhoneShell'
import {
    formatShiftClock,
    useInsuranceMockStore,
    type TimelineTile,
} from '@/store/insuranceMockStore'
import classNames from '@/utils/classNames'

const protectionUi = {
    inactive: {
        bar: 'bg-gray-300 text-gray-800',
        icon: <HiOutlineShieldExclamation className="text-xl" />,
        text: 'Brak aktywnej ochrony',
        cta: 'Aktywuj kod / Wykup polisę',
    },
    ready: {
        bar: 'bg-primary text-white',
        icon: <HiOutlineLockClosed className="text-xl" />,
        text: 'Polisa gotowa. Ochrona wystartuje po rozpoczęciu zmiany',
        cta: null,
    },
    active: {
        bar: 'bg-success text-white animate-pulse',
        icon: <HiOutlineShieldCheck className="text-xl" />,
        text: 'Jesteś chroniony',
        cta: null,
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
    const workspace = useInsuranceMockStore((s) => s.workspace)
    const protection = useInsuranceMockStore((s) => s.protection)
    const shift = useInsuranceMockStore((s) => s.shift)
    const shiftStartedAt = useInsuranceMockStore((s) => s.shiftStartedAt)
    const timeline = useInsuranceMockStore((s) => s.timeline)
    const startShift = useInsuranceMockStore((s) => s.startShift)
    const endShift = useInsuranceMockStore((s) => s.endShift)
    const setProtection = useInsuranceMockStore((s) => s.setProtection)
    const [clock, setClock] = useState('00h 00m')

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

    if (!workspace) {
        return <Navigate to="/workspace" replace />
    }

    const p = protectionUi[protection]

    return (
        <PhoneShell>
            {/* Strefa A — Status ochrony */}
            <div className={classNames('px-4 py-3 flex items-start gap-3', p.bar)}>
                <div className="mt-0.5">{p.icon}</div>
                <div className="flex-1">
                    <div className="text-xs font-semibold uppercase tracking-wide opacity-90">
                        Status ochrony
                    </div>
                    <div className="font-semibold leading-snug">{p.text}</div>
                    {p.cta && (
                        <Button
                            size="sm"
                            className="mt-2 bg-white text-gray-900 hover:bg-gray-100"
                            onClick={() => setProtection('ready')}
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
                <div className="mb-6 font-semibold heading-text">
                    {workspace.name}
                    <span className="block text-sm font-normal text-gray-500">
                        {workspace.city}
                        {workspace.temporary ? ' · tymczasowa' : ''}
                    </span>
                </div>

                {/* Strefa B — Bramka */}
                <Card className="mb-8 text-center">
                    <h5 className="mb-4">Odbicie na bramce</h5>
                    <Button
                        block
                        size="lg"
                        variant={shift === 'running' ? 'default' : 'solid'}
                        className={classNames(
                            'h-16 text-lg font-semibold',
                            shift === 'running' && 'bg-gray-200 dark:bg-gray-700',
                        )}
                        onClick={() =>
                            shift === 'running' ? endShift() : startShift()
                        }
                    >
                        {shift === 'running'
                            ? 'Zakończ zmianę'
                            : 'Rozpocznij pracę'}
                    </Button>
                    {shift === 'running' && (
                        <p className="mt-4 text-base font-semibold heading-text">
                            Trwa zmiana: {clock}
                        </p>
                    )}
                </Card>

                {/* Strefa timeline */}
                <h5 className="mb-4">Pamiętnik</h5>
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
                            </Timeline.Item>
                        ))}
                    </Timeline>
                )}
            </div>

            {/* Strefa C — FAB */}
            <button
                type="button"
                onClick={() => navigate('/report')}
                className="absolute bottom-6 right-5 z-20 flex h-16 w-16 items-center justify-center rounded-full bg-error text-white shadow-lg shadow-error/40 hover:scale-105 active:scale-95 transition-transform"
                aria-label="Zgłoś zdarzenie"
            >
                <HiOutlineExclamation className="text-3xl" />
            </button>
        </PhoneShell>
    )
}

export default WorkDashboard
