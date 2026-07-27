import { useState } from 'react'
import { useNavigate } from 'react-router'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Alert from '@/components/ui/Alert'
import PhoneShell from '@/views/pamietnik/PhoneShell'
import { useInsuranceMockStore } from '@/store/insuranceMockStore'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

const SignIn = () => {
    const navigate = useNavigate()
    const setPendingPhone = useInsuranceMockStore((s) => s.setPendingPhone)
    const [phone, setPhone] = useState('+48 ')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const onSubmit = async () => {
        const digits = phone.replace(/\D/g, '')
        if (digits.length < 11) {
            setError('Podaj numer telefonu w formacie +48 XXX XXX XXX')
            return
        }
        setError('')
        setLoading(true)
        setPendingPhone(phone.trim())
        await new Promise((r) => setTimeout(r, 600))
        setLoading(false)
        toast.push(
            <Notification title="Kod wysłany" type="success">
                SMS mock — użyj kodu 1234
            </Notification>,
            { placement: 'top-center' },
        )
        navigate('/otp')
    }

    return (
        <PhoneShell>
            <div className="flex flex-1 flex-col justify-center px-6 py-10">
                <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-2">
                    Pamiętnik Ubezpieczeniowy
                </p>
                <h4 className="mb-2">Zaloguj się numerem telefonu</h4>
                <p className="mb-8 text-sm">
                    Bez haseł. Wyślemy jednorazowy kod SMS — szybkie wejście na
                    hali.
                </p>
                {error && (
                    <Alert showIcon className="mb-4" type="danger">
                        {error}
                    </Alert>
                )}
                <label className="mb-1 block text-sm font-medium heading-text">
                    Numer telefonu
                </label>
                <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+48 500 600 700"
                    inputMode="tel"
                    className="mb-6"
                    size="lg"
                />
                <Button
                    block
                    variant="solid"
                    size="lg"
                    loading={loading}
                    onClick={() => void onSubmit()}
                >
                    Wyślij kod
                </Button>
            </div>
        </PhoneShell>
    )
}

export default SignIn
