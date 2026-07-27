import type { ReactNode } from 'react'
import classNames from '@/utils/classNames'

type Props = {
    children: ReactNode
    className?: string
}

/** Mobile-first frame so desktop still feels like warehouse phone UI. */
const PhoneShell = ({ children, className }: Props) => {
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex justify-center">
            <div
                className={classNames(
                    'w-full max-w-[430px] min-h-screen bg-white dark:bg-gray-900 shadow-sm relative flex flex-col',
                    className,
                )}
            >
                {children}
            </div>
        </div>
    )
}

export default PhoneShell
