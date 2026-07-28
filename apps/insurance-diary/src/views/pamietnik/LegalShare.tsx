import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { HiOutlineArrowLeft } from 'react-icons/hi'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Alert from '@/components/ui/Alert'
import Checkbox from '@/components/ui/Checkbox'
import PhoneShell from './PhoneShell'
import { useInsuranceMockStore } from '@/store/insuranceMockStore'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import dayjs from 'dayjs'

const LegalShare = () => {
    const navigate = useNavigate()
    const [params] = useSearchParams()
    const focus = params.get('focus')
    const timeline = useInsuranceMockStore((s) => s.timeline)
    const formal = useInsuranceMockStore((s) => s.formalProfile)
    const submitLegalShare = useInsuranceMockStore((s) => s.submitLegalShare)
    const shareable = useMemo(
        () => timeline.filter((t) => t.shareable),
        [timeline],
    )
    const [selected, setSelected] = useState<string[]>(() =>
        focus ? [focus] : [],
    )
    const [pin, setPin] = useState('')
    const [error, setError] = useState('')
    const [busy, setBusy] = useState(false)

    const toggle = (id: string, on: boolean) => {
        setSelected((prev) =>
            on ? [...new Set([...prev, id])] : prev.filter((x) => x !== id),
        )
    }

    const send = async () => {
        setError('')
        setBusy(true)
        await new Promise((r) => setTimeout(r, 1000))
        const result = submitLegalShare(selected, pin)
        setBusy(false)
        if (!result.ok) {
            setError(result.message)
            return
        }
        toast.push(
            <Notification title="Wysłano do Żylet" type="success">
                {result.message}. Dane jawne: {formal.firstName} {formal.lastName}{' '}
                ({formal.email}).
            </Notification>,
            { placement: 'top-center' },
        )
        navigate('/work', { replace: true })
    }

    return (
        <PhoneShell>
            <div className="px-4 py-4 flex items-center gap-3 border-b border-gray-200">
                <button
                    type="button"
                    className="p-2 rounded-lg hover:bg-gray-100"
                    onClick={() => navigate('/work')}
                >
                    <HiOutlineArrowLeft className="text-xl" />
                </button>
                <div>
                    <h5>Prawa Ręka</h5>
                    <p className="text-sm">Świadome udostępnienie dowodów</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <Alert showIcon type="info">
                    Zaznacz wpisy z osi czasu, które chcesz bezpiecznie przesłać
                    do bezpłatnej analizy. Odblokujesz je lokalnie PIN-em —
                    serwer nie ma Twojego klucza.
                </Alert>

                <div className="space-y-2">
                    {shareable.length === 0 && (
                        <p className="text-sm text-gray-500">
                            Brak wpisów do udostępnienia.
                        </p>
                    )}
                    {shareable.map((t) => (
                        <label
                            key={t.id}
                            className="flex gap-3 items-start rounded-xl border border-gray-200 p-3"
                        >
                            <Checkbox
                                checked={selected.includes(t.id)}
                                onChange={(checked) =>
                                    toggle(t.id, Boolean(checked))
                                }
                            />
                            <span className="text-sm">
                                <span className="font-semibold heading-text">
                                    [{dayjs(t.ts).format('DD.MM HH:mm')}]
                                </span>{' '}
                                {t.label}
                            </span>
                        </label>
                    ))}
                </div>

                <p className="text-sm text-gray-600">
                    Wyślesz <strong>{selected.length}</strong> dowod(ów) + dane
                    jawne: {formal.firstName} {formal.lastName}, {formal.email}
                </p>

                {busy && (
                    <Alert showIcon type="warning">
                        Odszyfrowywanie lokalne na urządzeniu…
                    </Alert>
                )}

                {error && (
                    <Alert showIcon type="danger">
                        {error}
                    </Alert>
                )}

                <Input
                    size="lg"
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="6-cyfrowy PIN"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                />

                <Button
                    block
                    size="lg"
                    variant="solid"
                    loading={busy}
                    onClick={() => void send()}
                >
                    Odblokuj i wyślij do prawnika
                </Button>
            </div>
        </PhoneShell>
    )
}

export default LegalShare
