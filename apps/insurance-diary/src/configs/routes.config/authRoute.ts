import { lazy } from 'react'
import type { Routes } from '@/@types/routes'

const authRoute: Routes = [
    {
        key: 'signIn',
        path: `/sign-in`,
        component: lazy(() => import('@/views/auth/SignIn')),
        access: 'auth-only',
        meta: {
            pageContainerType: 'gutterless',
            footer: false,
        },
    },
    {
        key: 'otpVerification',
        path: `/otp`,
        component: lazy(() => import('@/views/auth/OtpVerification')),
        access: 'auth-only',
        meta: {
            pageContainerType: 'gutterless',
            footer: false,
        },
    },
]

export default authRoute
