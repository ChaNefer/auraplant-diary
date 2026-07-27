import { lazy } from 'react'
import authRoute from './authRoute'
import type { Routes, RouteAccessType } from '@/@types/routes'

export const routes: Routes = [
    {
        key: 'workspace',
        path: '/workspace',
        component: lazy(() => import('@/views/pamietnik/WorkspaceSelect')),
        authority: [],
        access: 'protected',
        meta: { pageContainerType: 'gutterless', footer: false },
    },
    {
        key: 'work',
        path: '/work',
        component: lazy(() => import('@/views/pamietnik/WorkDashboard')),
        authority: [],
        access: 'protected',
        meta: { pageContainerType: 'gutterless', footer: false },
    },
    {
        key: 'report',
        path: '/report',
        component: lazy(() => import('@/views/pamietnik/ReportTriage')),
        authority: [],
        access: 'protected',
        meta: { pageContainerType: 'gutterless', footer: false },
    },
    {
        key: 'reportEvidence',
        path: '/report/evidence',
        component: lazy(() => import('@/views/pamietnik/ReportEvidence')),
        authority: [],
        access: 'protected',
        meta: { pageContainerType: 'gutterless', footer: false },
    },
    {
        key: 'profile',
        path: '/profile',
        component: lazy(() => import('@/views/pamietnik/Profile')),
        authority: [],
        access: 'protected',
        meta: { pageContainerType: 'gutterless', footer: false },
    },
    ...authRoute,
]

export const getRoutesByAccess = (accessType: RouteAccessType) =>
    routes.filter((route) => route.access === accessType)

export const getProtectedRoutes = () => getRoutesByAccess('protected')
export const getAuthOnlyRoutes = () => getRoutesByAccess('auth-only')
export const getPublicRoutes = () => getRoutesByAccess('public')
