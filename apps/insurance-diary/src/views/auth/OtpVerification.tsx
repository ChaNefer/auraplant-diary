import { useState } from 'react'
import { useNavigate } from 'react-router'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Alert from '@/components/ui/Alert'
import PhoneShell from '@/views/pamietnik/PhoneShell'
import { useInsuranceMockStore } from '@/store/insuranceMockStore'
import { useSessionUser, useToken } from '@/store/authStore'

const OtpVerification = () => {
    const navigate = useNavigate()
    const pendingPhone = useInsuranceMockStore((s) => s.pendingPhone)
    const setUserPhone = useInsuranceMockStore((s) => s.setUserPhone)
    const onboardingDone = useInsuranceMockStore((s) => s.onboardingDone)
    const setSessionSignedIn = useSessionUser((s) => s.setSessionSignedIn)
    const setUser = useSessionUser((s) => s.setUser)
    const { setToken } = useToken()
    const [otp, setOtp] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const verify = async () => {
        if (otp.trim() !== '1234') {
            setError('Nieprawidłowy kod. W mockupu użyj: 1234')
            return
        }
        setLoading(true)
        await new Promise((r) => setTimeout(r, 500))
        const phone = pendingPhone || '+48 500 000 000'
        setUserPhone(phone)
        setToken('mock-insurance-token')
        setSessionSignedIn(true)
        setUser({
            userName: 'Jan Kowalski',
            email: phone,
            authority: ['user'],
            avatar: '',
        })
        setLoading(false)
        navigate(onboardingDone ? '/work' : '/onboarding/formal', {
            replace: true,
        })
    }

    return (
        <PhoneShell>
            <div className="flex flex-1 flex-col justify-center px-6 py-10">
                <h4 className="mb-2">Wpisz kod z SMS</h4>
                <p className="mb-2 text-sm">
                    Kod wysłany na{' '}
                    <span className="font-semibold heading-text">
                        {pendingPhone || 'Twój numer'}
                    </span>
                </p>
                <Alert showIcon className="mb-6" type="info">
                    Mockup: wpisz <strong>1234</strong>
                </Alert>
                {error && (
                    <Alert showIcon className="mb-4" type="danger">
                        {error}
                    </Alert>
                )}
                <Input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="1234"
                    inputMode="numeric"
                    maxLength={4}
                    size="lg"
                    className="mb-6 text-center text-2xl tracking-[0.4em]"
                />
                <Button
                    block
                    variant="solid"
                    size="lg"
                    loading={loading}
                    onClick={() => void verify()}
                >
                    Potwierdź
                </Button>
                <Button
                    block
                    variant="plain"
                    className="mt-3"
                    onClick={() => navigate('/sign-in')}
                >
                    Zmień numer
                </Button>
            </div>
        </PhoneShell>
    )
}

export default OtpVerification
