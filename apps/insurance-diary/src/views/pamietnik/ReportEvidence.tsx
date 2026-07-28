import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import {
    HiOutlineArrowLeft,
    HiOutlineMicrophone,
    HiOutlineCamera,
    HiOutlineCheck,
} from 'react-icons/hi'
import Button from '@/components/ui/Button'
import PhoneShell from './PhoneShell'
import { useInsuranceMockStore } from '@/store/insuranceMockStore'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import classNames from '@/utils/classNames'

const ReportEvidence = () => {
    const navigate = useNavigate()
    const pendingIncident = useInsuranceMockStore((s) => s.pendingIncident)
    const pendingPhotoName = useInsuranceMockStore((s) => s.pendingPhotoName)
    const pendingVoiceSeconds = useInsuranceMockStore(
        (s) => s.pendingVoiceSeconds,
    )
    const setPendingPhotoName = useInsuranceMockStore(
        (s) => s.setPendingPhotoName,
    )
    const setPendingVoiceSeconds = useInsuranceMockStore(
        (s) => s.setPendingVoiceSeconds,
    )
    const commitIncident = useInsuranceMockStore((s) => s.commitIncident)
    const fileRef = useRef<HTMLInputElement>(null)
    const [recording, setRecording] = useState(false)
    const [seconds, setSeconds] = useState(0)
    const timerRef = useRef<number | null>(null)

    useEffect(() => {
        return () => {
            if (timerRef.current) window.clearInterval(timerRef.current)
        }
    }, [])

    if (!pendingIncident) {
        return <Navigate to="/report" replace />
    }

    const startVoice = () => {
        setRecording(true)
        setSeconds(0)
        timerRef.current = window.setInterval(() => {
            setSeconds((s) => s + 1)
        }, 1000)
    }

    const stopVoice = () => {
        if (timerRef.current) window.clearInterval(timerRef.current)
        setRecording(false)
        setPendingVoiceSeconds(Math.max(seconds, 1))
    }

    const save = () => {
        const id = commitIncident()
        toast.push(
            <Notification title="Dowód zapisany" type="success">
                Zdarzenie na osi czasu. Możesz skonsultować je z prawnikiem.
            </Notification>,
            { placement: 'top-center' },
        )
        navigate(id ? `/work` : '/work', { replace: true })
    }

    return (
        <PhoneShell>
            <div className="px-4 py-4 flex items-center gap-3 border-b border-gray-200 dark:border-gray-800">
                <button
                    type="button"
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => navigate('/report')}
                >
                    <HiOutlineArrowLeft className="text-xl" />
                </button>
                <div>
                    <h5>Zrzut dowodów</h5>
                    <p className="text-sm">Zdjęcie + głos — bez pisania.</p>
                </div>
            </div>

            <div className="flex-1 p-5 space-y-5">
                <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                        const f = e.target.files?.[0]
                        setPendingPhotoName(f?.name ?? 'zdjecie.jpg')
                    }}
                />

                <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-full min-h-[140px] rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-2 hover:border-primary"
                >
                    <HiOutlineCamera className="text-4xl text-primary" />
                    <span className="font-semibold heading-text">
                        Zrób zdjęcie miejsca / obrażeń
                    </span>
                    {pendingPhotoName && (
                        <span className="text-sm text-success flex items-center gap-1">
                            <HiOutlineCheck /> {pendingPhotoName}
                        </span>
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => (recording ? stopVoice() : startVoice())}
                    className={classNames(
                        'w-full min-h-[140px] rounded-2xl border-2 flex flex-col items-center justify-center gap-2',
                        recording
                            ? 'border-error bg-error-subtle'
                            : 'border-gray-300 dark:border-gray-600 hover:border-primary',
                    )}
                >
                    <HiOutlineMicrophone
                        className={classNames(
                            'text-4xl',
                            recording ? 'text-error animate-pulse' : 'text-primary',
                        )}
                    />
                    <span className="font-semibold heading-text">
                        {recording
                            ? `Nagrywanie… ${seconds}s (tapnij aby zatrzymać)`
                            : 'Notatka głosowa'}
                    </span>
                    {!recording && pendingVoiceSeconds > 0 && (
                        <span className="text-sm text-success flex items-center gap-1">
                            <HiOutlineCheck /> Zapisano {pendingVoiceSeconds}s
                        </span>
                    )}
                </button>

                <Button
                    block
                    size="lg"
                    variant="solid"
                    className="h-14"
                    onClick={save}
                >
                    Zapisz dowód
                </Button>
            </div>
        </PhoneShell>
    )
}

export default ReportEvidence
