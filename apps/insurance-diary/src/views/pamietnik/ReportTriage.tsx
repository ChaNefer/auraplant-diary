import type { ReactNode } from 'react'
import { useNavigate } from 'react-router'
import {
    HiOutlineUser,
    HiOutlineExclamationCircle,
    HiOutlineEye,
    HiOutlineArrowLeft,
} from 'react-icons/hi'
import PhoneShell from './PhoneShell'
import {
    useInsuranceMockStore,
    type IncidentCategory,
} from '@/store/insuranceMockStore'
import classNames from '@/utils/classNames'

const tiles: {
    id: Exclude<IncidentCategory, null>
    title: string
    desc: string
    icon: ReactNode
    tone: string
}[] = [
    {
        id: 'my_accident',
        title: 'Mój wypadek',
        desc: 'Upadek, skaleczenie, uraz',
        icon: <HiOutlineUser className="text-3xl" />,
        tone: 'border-error text-error bg-error-subtle',
    },
    {
        id: 'near_miss',
        title: 'Zagrożenie / Near Miss',
        desc: 'Śliska podłoga, zablokowane wyjście',
        icon: <HiOutlineExclamationCircle className="text-3xl" />,
        tone: 'border-warning text-warning bg-warning-subtle',
    },
    {
        id: 'witness',
        title: 'Wypadek kogoś innego',
        desc: 'Jestem świadkiem zdarzenia',
        icon: <HiOutlineEye className="text-3xl" />,
        tone: 'border-primary text-primary bg-primary-subtle',
    },
]

const ReportTriage = () => {
    const navigate = useNavigate()
    const setPendingIncident = useInsuranceMockStore(
        (s) => s.setPendingIncident,
    )

    const pick = (id: Exclude<IncidentCategory, null>) => {
        setPendingIncident(id)
        navigate('/report/evidence')
    }

    return (
        <PhoneShell className="bg-gray-950 text-white">
            <div className="px-4 py-4 flex items-center gap-3 border-b border-white/10">
                <button
                    type="button"
                    className="p-2 rounded-lg hover:bg-white/10"
                    onClick={() => navigate('/work')}
                >
                    <HiOutlineArrowLeft className="text-xl" />
                </button>
                <div>
                    <div className="text-xs uppercase tracking-wide text-error font-semibold">
                        Tryb awaryjny
                    </div>
                    <h5 className="text-white">Co się stało?</h5>
                </div>
            </div>
            <div className="flex-1 p-4 space-y-3">
                <p className="text-sm text-gray-300 mb-2">
                    Wybierz kategorię — duże przyciski, bez zbędnych pytań.
                </p>
                {tiles.map((t) => (
                    <button
                        key={t.id}
                        type="button"
                        onClick={() => pick(t.id)}
                        className={classNames(
                            'w-full rounded-2xl border-2 px-4 py-5 text-left flex gap-4 items-center min-h-[96px]',
                            t.tone,
                        )}
                    >
                        <div className="shrink-0">{t.icon}</div>
                        <div>
                            <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                {t.title}
                            </div>
                            <div className="text-sm opacity-80 text-gray-800 dark:text-gray-200">
                                {t.desc}
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </PhoneShell>
    )
}

export default ReportTriage
