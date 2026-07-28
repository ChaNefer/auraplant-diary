import { useState } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'

const slides = [
    {
        title: 'Zakaz palenia',
        body: 'Na terenie hali i magazynu obowiązuje całkowity zakaz palenia. Używaj wyznaczonych stref na zewnątrz.',
    },
    {
        title: 'Apteczka i ewakuacja',
        body: 'Apteczka przy wejściu B. Drogi ewakuacyjne oznaczone zielonymi znakami — nie zastawiaj ich.',
    },
    {
        title: 'Wózki widłowe',
        body: 'Nie wchodź pod unoszony ładunek. Zachowaj dystans i kontakt wzrokowy z operatorem.',
    },
    {
        title: 'Zgłaszaj zagrożenia',
        body: 'Śliska podłoga, zablokowane wyjście, uszkodzony sprzęt — zgłoś w aplikacji (Near Miss), zanim ktoś ucierpi.',
    },
]

type Props = {
    isOpen: boolean
    companyName: string
    onAccept: () => void
    onClose: () => void
}

const BhpGateModal = ({ isOpen, companyName, onAccept, onClose }: Props) => {
    const [step, setStep] = useState(0)
    const last = step >= slides.length - 1
    const slide = slides[step]

    const resetAndClose = () => {
        setStep(0)
        onClose()
    }

    return (
        <Dialog isOpen={isOpen} onClose={resetAndClose} width={400}>
            <div className="text-xs uppercase tracking-wide text-warning font-semibold mb-2">
                Bramka BHP
            </div>
            <h5 className="mb-2">
                Zanim rozpoczniesz pierwszą zmianę w {companyName}
            </h5>
            <p className="text-sm mb-4">
                Musisz zapoznać się z zasadami bezpieczeństwa.
            </p>
            <div className="rounded-xl border border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 p-4 mb-4 min-h-[140px]">
                <div className="text-xs text-gray-500 mb-2">
                    Plansza {step + 1} / {slides.length}
                </div>
                <div className="font-semibold heading-text text-lg mb-2">
                    {slide.title}
                </div>
                <p className="text-sm">{slide.body}</p>
            </div>
            <div className="flex gap-2 justify-end">
                {!last ? (
                    <Button variant="solid" onClick={() => setStep((s) => s + 1)}>
                        Dalej
                    </Button>
                ) : (
                    <Button
                        variant="solid"
                        onClick={() => {
                            setStep(0)
                            onAccept()
                        }}
                    >
                        Zrozumiałem i akceptuję
                    </Button>
                )}
            </div>
        </Dialog>
    )
}

export default BhpGateModal
