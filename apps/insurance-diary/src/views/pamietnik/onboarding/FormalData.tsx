import { useState } from 'react'
import { useNavigate } from 'react-router'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Alert from '@/components/ui/Alert'
import PhoneShell from '../PhoneShell'
import { useInsuranceMockStore } from '@/store/insuranceMockStore'

const FormalData = () => {
    const navigate = useNavigate()
    const completeFormal = useInsuranceMockStore((s) => s.completeFormal)
    const user = useInsuranceMockStore((s) => s.user)
    const [firstName, setFirstName] = useState(user.firstName || 'Jan')
    const [lastName, setLastName] = useState(user.lastName || 'Kowalski')
    const [email, setEmail] = useState(user.email || 'jan.kowalski@email.pl')
    const [pesel, setPesel] = useState(user.pesel || '')
    const [error, setError] = useState('')

    const next = () => {
        if (!firstName.trim() || !lastName.trim() || !email.trim()) {
            setError('Imię, nazwisko i e-mail są wymagane do polisy.')
            return
        }
        completeFormal({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            pesel: pesel.trim(),
        })
        navigate('/onboarding/pay')
    }

    return (
        <PhoneShell>
            <div className="flex flex-1 flex-col px-5 py-8">
                <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-2">
                    Krok 1/3 · Polisa
                </p>
                <h4 className="mb-2">Dane formalne</h4>
                <Alert showIcon className="mb-6" type="info">
                    Te dane są niezbędne wyłącznie do wygenerowania ważnej
                    polisy ubezpieczeniowej. Nie trafiają do zaszyfrowanego
                    Pamiętnika.
                </Alert>
                {error && (
                    <Alert showIcon className="mb-4" type="danger">
                        {error}
                    </Alert>
                )}
                <div className="space-y-3 mb-8">
                    <Input
                        size="lg"
                        placeholder="Imię"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                    <Input
                        size="lg"
                        placeholder="Nazwisko"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />
                    <Input
                        size="lg"
                        type="email"
                        placeholder="E-mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Input
                        size="lg"
                        placeholder="PESEL (opcjonalnie)"
                        value={pesel}
                        onChange={(e) => setPesel(e.target.value)}
                    />
                </div>
                <Button block size="lg" variant="solid" onClick={next}>
                    Dalej — zakup polisy
                </Button>
            </div>
        </PhoneShell>
    )
}

export default FormalData
