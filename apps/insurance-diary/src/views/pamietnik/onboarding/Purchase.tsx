import { useState } from 'react'
import { useNavigate } from 'react-router'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Alert from '@/components/ui/Alert'
import PhoneShell from '../PhoneShell'
import { useInsuranceMockStore } from '@/store/insuranceMockStore'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import classNames from '@/utils/classNames'
import dayjs from 'dayjs'

const periods = [
    { days: 30, label: '30 dni', price: '49 zł' },
    { days: 90, label: '90 dni', price: '129 zł' },
]

const Purchase = () => {
    const navigate = useNavigate()
    const purchasePolicy = useInsuranceMockStore((s) => s.purchasePolicy)
    const [days, setDays] = useState(30)
    const [paying, setPaying] = useState(false)

    const activeFrom = dayjs().add(1, 'day').format('DD.MM.YYYY')

    const pay = async (method: 'blik' | 'apple') => {
        setPaying(true)
        await new Promise((r) => setTimeout(r, 900))
        purchasePolicy(days, method)
        setPaying(false)
        toast.push(
            <Notification title="Płatność przyjęta" type="success">
                Mock {method === 'blik' ? 'BLIK' : 'Apple Pay'}. Ochrona od{' '}
                {activeFrom} (karencja).
            </Notification>,
            { placement: 'top-center' },
        )
        navigate('/onboarding/vault')
    }

    return (
        <PhoneShell>
            <div className="flex flex-1 flex-col px-5 py-8">
                <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-2">
                    Krok 2/3 · Zakup B2C
                </p>
                <h4 className="mb-2">Wykup polisę</h4>
                <p className="mb-4 text-sm">
                    Sam opłacasz ochronę na wybrany okres. Karencja: ochrona
                    rusza najwcześniej od jutra.
                </p>
                <Alert showIcon className="mb-6" type="warning">
                    Ochrona od: <strong>{activeFrom}</strong>
                </Alert>
                <div className="grid grid-cols-2 gap-3 mb-8">
                    {periods.map((p) => (
                        <button
                            key={p.days}
                            type="button"
                            onClick={() => setDays(p.days)}
                            className={classNames(
                                'rounded-xl border-2 p-4 text-left',
                                days === p.days
                                    ? 'border-primary bg-primary-subtle'
                                    : 'border-gray-200',
                            )}
                        >
                            <div className="font-semibold heading-text">
                                {p.label}
                            </div>
                            <div className="text-lg text-primary font-bold">
                                {p.price}
                            </div>
                        </button>
                    ))}
                </div>
                <Card className="mb-4">
                    <p className="text-sm mb-4">
                        Wybierz metodę płatności (mock — nic nie pobieramy).
                    </p>
                    <div className="space-y-3">
                        <Button
                            block
                            size="lg"
                            variant="solid"
                            loading={paying}
                            onClick={() => void pay('blik')}
                        >
                            Zapłać BLIKIEM
                        </Button>
                        <Button
                            block
                            size="lg"
                            variant="default"
                            loading={paying}
                            onClick={() => void pay('apple')}
                        >
                            Apple Pay
                        </Button>
                    </div>
                </Card>
            </div>
        </PhoneShell>
    )
}

export default Purchase
