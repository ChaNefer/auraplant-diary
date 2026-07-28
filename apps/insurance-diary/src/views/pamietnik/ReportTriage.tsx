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
        tone: 'border-error text-error bg-white',
    },
    {
        id: 'near_miss',
        title: 'Zagrożenie / Near Miss',
        desc: 'Śliska podłoga, zablokowane wyjście',
        icon: <HiOutlineExclamationCircle className="text-3xl" />,
        tone: 'border-warning text-warning bg-white',
    },
    {
        id: 'witness',
        title: 'Wypadek kogoś innego',
        desc: 'Jestem świadkiem zdarzenia',
        icon: <HiOutlineEye className="text-3xl" />,
        tone: 'border-primary text-primary bg-white',
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
        <PhoneShell className="bg-white">
            <div className="px-4 py-4 flex items-center gap-3 border-b border-gray-200">
                <button
                    type="button"
                    className="p-2 rounded-lg hover:bg-gray-100"
                    onClick={() => navigate('/work')}
                >
                    <HiOutlineArrowLeft className="text-xl text-gray-900" />
                </button>
                <div>
                    <div className="text-xs uppercase tracking-wide text-error font-semibold">
                        Tryb awaryjny
                    </div>
                    <h5 className="text-gray-900">Co się stało?</h5>
                </div>
            </div>
            <div className="flex-1 p-4 space-y-3 bg-white">
                <p className="text-sm text-gray-600 mb-2">
                    Wybierz kategorię — duże przyciski, bez zbędnych pytań.
                </p>
                {tiles.map((t) => (
                    <button
                        key={t.id}
                        type="button"
                        onClick={() => pick(t.id)}
                        className={classNames(
                            'w-full rounded-2xl border-2 px-4 py-5 text-left flex gap-4 items-center min-h-[96px] shadow-sm',
                            t.tone,
                        )}
                    >
                        <div className="shrink-0">{t.icon}</div>
                        <div>
                            <div className="text-lg font-semibold text-gray-900">
                                {t.title}
                            </div>
                            <div className="text-sm text-gray-600">
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
