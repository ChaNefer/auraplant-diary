import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Dialog from '@/components/ui/Dialog'
import PhoneShell from './PhoneShell'
import { searchAgencies } from '@/mock/agencies'
import { useInsuranceMockStore } from '@/store/insuranceMockStore'

const WorkspaceSelect = () => {
    const navigate = useNavigate()
    const customAgencies = useInsuranceMockStore((s) => s.customAgencies)
    const selectWorkplace = useInsuranceMockStore((s) => s.selectWorkplace)
    const addCustomAgency = useInsuranceMockStore((s) => s.addCustomAgency)
    const [query, setQuery] = useState('')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [newName, setNewName] = useState('')
    const [newCity, setNewCity] = useState('')

    const results = useMemo(
        () => searchAgencies(query, customAgencies),
        [query, customAgencies],
    )

    const pick = (id: string, name: string, city: string, temporary?: boolean) => {
        selectWorkplace({ id, name, city, temporary })
        navigate('/work', { replace: true })
    }

    const addCompany = () => {
        if (newName.trim().length < 2) return
        addCustomAgency(newName.trim(), newCity.trim())
        setDialogOpen(false)
        navigate('/work', { replace: true })
    }

    return (
        <PhoneShell>
            <div className="flex flex-1 flex-col px-5 py-8">
                <h4 className="mb-2">Gdzie teraz pracujesz?</h4>
                <p className="mb-6 text-sm">
                    Wpisz pierwsze 3 litery nazwy pracodawcy (agencja lub
                    zakład).
                </p>
                <Input
                    size="lg"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="np. Jan…"
                    autoFocus
                    className="mb-4"
                />
                <div className="flex-1 space-y-2 overflow-y-auto pb-4">
                    {query.trim().length > 0 && query.trim().length < 3 && (
                        <p className="text-sm text-gray-500">
                            Wpisz jeszcze {3 - query.trim().length} znak(i)…
                        </p>
                    )}
                    {results.map((a) => (
                        <button
                            key={a.id}
                            type="button"
                            onClick={() =>
                                pick(a.id, a.name, a.city, a.temporary)
                            }
                            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3 text-left hover:border-primary hover:bg-primary-subtle transition-colors"
                        >
                            <div className="font-semibold heading-text">
                                {a.name}
                                {a.temporary && (
                                    <span className="ml-2 text-xs font-normal text-warning">
                                        tymczasowa
                                    </span>
                                )}
                            </div>
                            <div className="text-sm text-gray-500">{a.city}</div>
                        </button>
                    ))}
                </div>
                <Button
                    block
                    variant="default"
                    size="lg"
                    className="mt-auto"
                    onClick={() => setDialogOpen(true)}
                >
                    Nie widzę mojego pracodawcy – Dodaj firmę
                </Button>
            </div>

            <Dialog
                isOpen={dialogOpen}
                onClose={() => setDialogOpen(false)}
            >
                <h5 className="mb-4">Dodaj firmę</h5>
                <p className="mb-4 text-sm">
                    Wpisz nazwę z palca. System utworzy tymczasowy węzeł (radar
                    analityczny po stronie backendu — w mockupu lokalnie).
                </p>
                <Input
                    className="mb-3"
                    placeholder="Nazwa firmy"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                />
                <Input
                    className="mb-6"
                    placeholder="Miasto (opcjonalnie)"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                />
                <div className="flex gap-2 justify-end">
                    <Button variant="plain" onClick={() => setDialogOpen(false)}>
                        Anuluj
                    </Button>
                    <Button variant="solid" onClick={addCompany}>
                        Dodaj i kontynuuj
                    </Button>
                </div>
            </Dialog>
        </PhoneShell>
    )
}

export default WorkspaceSelect
