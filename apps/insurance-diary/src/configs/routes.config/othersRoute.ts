import { lazy } from 'react'
import type { Routes } from '@/@types/routes'

const othersRoute: Routes = [
    {
        key: 'accessDenied',
        path: '/access-denied',
        component: lazy(
            () => import('@/views/others/AccessDenied'),
        ),
        authority: [],
        access: 'protected',
    },
]

export default othersRoute
