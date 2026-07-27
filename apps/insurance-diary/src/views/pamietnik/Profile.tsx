import { useState } from 'react'
import { useNavigate } from 'react-router'
import { HiOutlineArrowLeft } from 'react-icons/hi'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import Tag from '@/components/ui/Tag'
import PhoneShell from './PhoneShell'
import { useInsuranceMockStore } from '@/store/insuranceMockStore'
import { useAuth } from '@/auth'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

const Profile = () => {
    const navigate = useNavigate()
    const { signOut } = useAuth()
    const user = useInsuranceMockStore((s) => s.user)
    const updateUser = useInsuranceMockStore((s) => s.updateUser)
    const policies = useInsuranceMockStore((s) => s.policies)
    const setWorkspace = useInsuranceMockStore((s) => s.setWorkspace)
    const [lead, setLead] = useState('')
    const [saving, setSaving] = useState(false)

    const saveLead = () => {
        if (!lead.trim()) return
        setSaving(true)
        window.setTimeout(() => {
            setSaving(false)
            setLead('')
            toast.push(
                <Notification title="Wysłano" type="success">
                    Zgłoszenie trafiło do panelu obsługi prawnej (mock).
                </Notification>,
                { placement: 'top-center' },
            )
        }, 500)
    }

    return (
        <PhoneShell>
            <div className="px-4 py-4 flex items-center gap-3 border-b border-gray-200 dark:border-gray-800">
                <button
                    type="button"
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => navigate('/work')}
                >
                    <HiOutlineArrowLeft className="text-xl" />
                </button>
                <h5>Profil i dokumenty</h5>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
                <section>
                    <h6 className="mb-3">Moje dane</h6>
                    <div className="space-y-3">
                        <Input
                            placeholder="Imię"
                            value={user.firstName}
                            onChange={(e) =>
                                updateUser({ firstName: e.target.value })
                            }
                        />
                        <Input
                            placeholder="Nazwisko"
                            value={user.lastName}
                            onChange={(e) =>
                                updateUser({ lastName: e.target.value })
                            }
                        />
                        <Input
                            placeholder="Telefon"
                            value={user.phone}
                            onChange={(e) =>
                                updateUser({ phone: e.target.value })
                            }
                        />
                        <Input
                            placeholder="PESEL"
                            value={user.pesel}
                            onChange={(e) =>
                                updateUser({ pesel: e.target.value })
                            }
                        />
                        <Input
                            placeholder="Adres"
                            value={user.address}
                            onChange={(e) =>
                                updateUser({ address: e.target.value })
                            }
                        />
                    </div>
                </section>

                <section>
                    <h6 className="mb-3">Zgłoś problem prawny</h6>
                    <p className="text-sm mb-3">
                        Brak wypłaty za nadgodziny, kaucja za mieszkanie —
                        prośba o konsultację.
                    </p>
                    <Input
                        textArea
                        rows={3}
                        placeholder="Opisz krótko problem…"
                        value={lead}
                        onChange={(e) => setLead(e.target.value)}
                        className="mb-3"
                    />
                    <Button
                        variant="solid"
                        loading={saving}
                        onClick={saveLead}
                    >
                        Wyślij do obsługi prawnej
                    </Button>
                </section>

                <section>
                    <h6 className="mb-3">Historia ubezpieczeń</h6>
                    <div className="space-y-3">
                        {policies.map((p) => (
                            <Card key={p.id}>
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <div className="font-semibold heading-text">
                                            {p.name}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Ważna do {p.validTo}
                                        </div>
                                    </div>
                                    <Tag
                                        className={
                                            p.status === 'active'
                                                ? 'bg-success-subtle text-success'
                                                : 'bg-gray-100 text-gray-600'
                                        }
                                    >
                                        {p.status === 'active'
                                            ? 'Aktywna'
                                            : 'Wygasła'}
                                    </Tag>
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>

                <div className="space-y-2 pb-6">
                    <Button
                        block
                        variant="default"
                        onClick={() => {
                            setWorkspace(null)
                            navigate('/workspace')
                        }}
                    >
                        Zmień miejsce pracy
                    </Button>
                    <Button
                        block
                        variant="plain"
                        onClick={() => void signOut()}
                    >
                        Wyloguj
                    </Button>
                </div>
            </div>
        </PhoneShell>
    )
}

export default Profile
