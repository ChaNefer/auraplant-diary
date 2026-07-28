import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Alert from '@/components/ui/Alert'
import Checkbox from '@/components/ui/Checkbox'
import PhoneShell from '../PhoneShell'
import { useInsuranceMockStore } from '@/store/insuranceMockStore'
import classNames from '@/utils/classNames'

const SEED_POOL = [
    'jabłko',
    'most',
    'wiatr',
    'lampa',
    'rzeka',
    'księżyc',
    'stal',
    'ogień',
    'mapa',
    'cisza',
    'złoto',
    'ptak',
]

const VaultSetup = () => {
    const navigate = useNavigate()
    const setupVault = useInsuranceMockStore((s) => s.setupVault)
    const [method, setMethod] = useState<'pin' | 'seed'>('pin')
    const [pin, setPin] = useState('')
    const [pin2, setPin2] = useState('')
    const [ack, setAck] = useState(false)
    const [error, setError] = useState('')

    const seedWords = useMemo(
        () =>
            [...SEED_POOL].sort(() => Math.random() - 0.5).slice(0, 6),
        [],
    )

    const finish = () => {
        if (!ack) {
            setError('Zaznacz checkbox o utracie klucza — to wymóg prawny.')
            return
        }
        if (!/^\d{6}$/.test(pin)) {
            setError('PIN musi mieć dokładnie 6 cyfr.')
            return
        }
        if (pin !== pin2) {
            setError('PIN-y nie są zgodne.')
            return
        }
        setupVault({
            method,
            pin,
            seedWords: method === 'seed' ? seedWords : undefined,
        })
        navigate('/work', { replace: true })
    }

    return (
        <PhoneShell>
            <div className="flex flex-1 flex-col px-5 py-8">
                <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-2">
                    Krok 3/3 · Prywatność
                </p>
                <h4 className="mb-2">Jak zabezpieczysz Pamiętnik?</h4>
                <p className="mb-4 text-sm">
                    Dane polisy są jawne. Zdjęcia i notatki w Pamiętniku —
                    tylko z Twoim kluczem. My go nie przechowujemy.
                </p>

                <div className="grid grid-cols-1 gap-3 mb-6">
                    <button
                        type="button"
                        onClick={() => setMethod('pin')}
                        className={classNames(
                            'rounded-xl border-2 p-4 text-left',
                            method === 'pin'
                                ? 'border-primary bg-primary-subtle'
                                : 'border-gray-200',
                        )}
                    >
                        <div className="font-semibold heading-text">
                            Opcja A — 6-cyfrowy PIN
                        </div>
                        <div className="text-sm text-gray-500">
                            Wygodna, jak w aplikacji bankowej (większość osób)
                        </div>
                    </button>
                    <button
                        type="button"
                        onClick={() => setMethod('seed')}
                        className={classNames(
                            'rounded-xl border-2 p-4 text-left',
                            method === 'seed'
                                ? 'border-primary bg-primary-subtle'
                                : 'border-gray-200',
                        )}
                    >
                        <div className="font-semibold heading-text">
                            Opcja B — 6 słów (seed)
                        </div>
                        <div className="text-sm text-gray-500">
                            Dla purystów prywatności
                        </div>
                    </button>
                </div>

                {method === 'seed' && (
                    <Alert showIcon className="mb-4" type="info">
                        Zapisz te słowa offline:{' '}
                        <strong>{seedWords.join(' · ')}</strong>
                    </Alert>
                )}

                <div className="space-y-3 mb-6">
                    <Input
                        size="lg"
                        type="password"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="PIN odblokowania (6 cyfr)"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                    />
                    <Input
                        size="lg"
                        type="password"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="Powtórz PIN"
                        value={pin2}
                        onChange={(e) => setPin2(e.target.value)}
                    />
                </div>

                {error && (
                    <Alert showIcon className="mb-4" type="danger">
                        {error}
                    </Alert>
                )}

                <label className="flex gap-3 items-start mb-8 text-sm">
                    <Checkbox checked={ack} onChange={(v) => setAck(!!v)} />
                    <span>
                        Rozumiem, że aplikacja nie przechowuje mojego
                        PIN-u/hasła. Jego utrata oznacza bezpowrotną utratę
                        moich zdjęć i notatek.
                    </span>
                </label>

                <Button block size="lg" variant="solid" onClick={finish}>
                    Zabezpiecz i wejdź do aplikacji
                </Button>
            </div>
        </PhoneShell>
    )
}

export default VaultSetup
