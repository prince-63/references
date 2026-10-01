import {lazy, Suspense, useRef} from 'react'
import {Route, Routes} from 'react-router-dom'
import {useContext, useEffect} from 'react'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {safeParseInt} from 'utils/ConstFunctions'
import {AuthContext} from 'context/AuthContext'
import useDispatchAction from '@hooks/useDispatchAction'
import useRefreshToken from '@hooks/useRefreshToken'
import {getAccountData} from 'redux/Slices/AppSlice/settings/settings.slice'
import useSubscriptionDetails from '@hooks/useSubscriptionDetails'
import When from 'components/when/When'
import isPlanExpired from '@utils/isPlanExpired'
import leadsProfileRoutes from './leadsProfile.routes'
import settingsRoutes from './settings.routes'
import useAllUserPlan from '@hooks/useAllUserPlan'
import useSubRoleDetails from '@hooks/useSubRoleDetails'
import profileRoutes from './profile.routes'
import customerProfileRoutes from './customerProfile.routes'
import vspProfileRoutes from './vspProfile.routes'
import practiceProfileRoutes from './practiceProfile.routes'
import LoadingFallback from 'components/LoadingFallback'
import SetupTreatmentPlanTwoPaneEditPlan from 'screens/Plan/SetupTreatmentPlanTwoPaneEditPlan'
import CustomerCreateOrderPage from 'screens/PatientDetailsOverview.tsx/pages/CustomerPatientProfile/steps/CustomerCreateOrder'

const VspPatientProfile = lazy(
  () => import('screens/PatientDetailsOverview.tsx/pages/VspPatientProfile/VspPatientProfile')
)

const useCreation = <T,>(factory: () => T, deps: ReadonlyArray<unknown>) => {
  const ref = useRef<{deps: ReadonlyArray<unknown>; value: T} | null>(null)
  const depsChanged =
    !ref.current ||
    ref.current.deps.length !== deps.length ||
    ref.current.deps.some((dep, idx) => dep !== deps[idx])

  if (depsChanged) {
    ref.current = {deps, value: factory()}
  }

  return ref.current!.value
}

// Lazy load all route components for code splitting
const MainLayout = lazy(() => import('../screens/Layout'))
const PracticeLocationList = lazy(() => import('../screens/PracticeLocation/PracticeLocationList'))
const Chat = lazy(() => import('../screens/Patients/Chat/Chat'))
const LabChat = lazy(() => import('screens/LabChat/LabChat'))
const Production = lazy(() => import('../screens/Production/Production'))
const LeadsProfile = lazy(() => import('screens/Patients/LeadsProfile/LeadsProfile'))
const GlobalSearchMobile = lazy(
  () => import('screens/Dashboard/sidebar/GlobalSearch/GlobalSearchMobile')
)
const PricingPage = lazy(() => import('screens/DoctorProfile/PricingPage'))
const NotificationsMobileView = lazy(() => import('components/Dashboard/NotificationsMobileView'))
const HealthCheck = lazy(() => import('./HealthCheck'))
const CalendarPage = lazy(() => import('screens/Calendar/CalendarPage'))
const Notfound = lazy(() => import('components/errorHandler/Notfound'))
const Summary = lazy(() => import('screens/Summary/Summary'))
const BillingsAndPaymentsPage = lazy(
  () => import('screens/billingsAndPayments/BillingsAndPaymentsPage')
)
const SettingsPage = lazy(() => import('screens/settings/SettingsPage'))
const RewardsPage = lazy(() => import('screens/rewards/RewardsPage'))
const PracticeList = lazy(() => import('screens/Practices/PracticeList/PracticeList'))
const AddingPractice = lazy(() => import('screens/Practices/AddingPractices/AddingPractice'))
const AddPatient = lazy(() => import('components/modal/InvitePatient/AddPatient'))
const ClearLocalStorageAndReload = lazy(() => import('./ClearLocalStorageAndReload'))
const OrdersPage = lazy(() => import('screens/Orders/OrdersPage'))
const CreateOrderPage = lazy(() => import('screens/Orders/CreateOrderPage'))
const VSPCreateOrderPage = lazy(() => import('screens/VSP/CreateOrder/CreateOrder'))
const UpgradeRenewalSubscriptionForm = lazy(
  () => import('screens/settings/subscription/components/UpgradeRenewalSubscriptionForm')
)
const ViewOrderPage = lazy(() => import('screens/Orders/ViewOrderPage'))
const SmileSimulation = lazy(() => import('screens/SmileSimulation/SmileSimulation'))
const CustomerList = lazy(() => import('screens/Customers/CustomerList/CustomerList'))
const AddCustomer = lazy(() => import('screens/Customers/AddingCustomers/AddCustomer'))
const AddProfileSelectRole = lazy(() => import('components/menu/AddProfileSelectRole'))
const ArchivePatientsList = lazy(() => import('screens/Patients/PatientList/ArchivePatientsList'))
const PatientListParent = lazy(() => import('screens/Patients/PatientList/PatientListParent'))
const PlanExpiry = lazy(() => import('screens/Dashboard/dashboard/PlanExpiry'))
const LabStaffDeactivatedScreen = lazy(
  () => import('screens/Dashboard/dashboard/LabStaffDeactivatedScreen')
)
const SetupPlan = lazy(() => import('screens/Plan/SetupPlan'))
const ReviewTreatmentPlan = lazy(() => import('screens/Plan/ReviewTreatmentPlan'))
const AddLabs = lazy(() => import('screens/Labs/AddLab/AddLabs'))
const LabList = lazy(() => import('screens/Labs/LabList/LabList'))
const ConfirmBrandingDetails = lazy(
  () => import('components/GettingStarted/ConfirmBrandingDetails')
)
const RequestDeletion = lazy(() => import('screens/Dashboard/dashboard/RequestDeletion'))
const CaseRecordsPage = lazy(() =>
  import('screens/CaseRecords').then((m) => ({default: m.CaseRecordsPage}))
)
const UnprocessedOrders = lazy(() => import('screens/Orders/UnprocessedOrders'))
const CreateExistingCase = lazy(() => import('screens/ExistingCase/CreateExistingCase'))
const AlignerOrdersPage = lazy(() => import('screens/Orders/AlignerOrdersPage'))
const AccessControlUser = lazy(() => import('screens/AccessControl/AccessControlUser'))
const AccessControlOverview = lazy(
  () => import('screens/AccessControl/AccessControlList/AccessControlOverview')
)
const AccessControlUserList = lazy(
  () => import('screens/AccessControl/AccessControlList/AccessControlUserList')
)
const AccessControlLabsList = lazy(
  () => import('screens/AccessControl/AccessControlList/AccessControlLabsList')
)
const AccessControlRoles = lazy(() => import('screens/AccessControl/Roles/AccessControlRoles'))
const AccessControlAuditLogs = lazy(
  () => import('screens/AccessControl/AuditLogs/AccessControlAuditLogs')
)
const AddAccessControlUser = lazy(
  () => import('screens/AccessControl/AddAccessControlUsers/AddAccessControlUser')
)
const AddCustomRole = lazy(() => import('screens/AccessControl/Roles/AddCustomRole'))
const PatientDetailsOverview = lazy(
  () => import('screens/PatientDetailsOverview.tsx/PatientDetailsOverview')
)
const SetupTreatmentPlanTwoPane = lazy(() => import('screens/Plan/SetupTreatmentPlanTwoPane'))
const ProductionSetupPage = lazy(
  () => import('screens/Kanban/screens/ProductionSetup/ProductSetup')
)
const SelectTaskManufacturingType = lazy(
  () => import('screens/Kanban/screens/ProductionSetup/SelectTaskManufacturingType')
)
const ProductionSetupReview = lazy(
  () => import('screens/Kanban/screens/ProductionReview/ProductionSetupReview')
)
const AlignerTracking = lazy(() => import('screens/AlignerTracking/AlignerTracking'))
const AlignerProduction = lazy(() => import('screens/AlignerProduction/AlignerProduction'))
const AlignerPatientAnalytics = lazy(
  () => import('screens/AlignerPatientAnalytics/AlignerPatientAnalytics')
)
const CustomPlanningSetup = lazy(() => import('screens/Kanban/components/CustomPlanningSetup'))
const PlanningSetupStepper = lazy(() => import('screens/Kanban/components/PlanningSetupStepper'))
const ProductionSetupStepper = lazy(
  () => import('screens/Kanban/components/ProductionSetupStepper')
)
const PracticeProfile = lazy(() => import('screens/PracticeList/PracticeProfile'))
const PracticeLabProfile = lazy(() => import('screens/PracticeList/PracticeLabProfile'))
const CustomerProfile = lazy(() => import('screens/CustomerList/CustomerProfile'))
const GrowthPlanDashboard = lazy(() => import('screens/Dashboard/growthPlan/GrowthPlanDashboard'))
const EnterpriseAdminDashboard = lazy(
  () => import('screens/Dashboard/enterprise/EnterpriseAdminDashboard')
)
const PracticeConnectedOrgDashboard = lazy(
  () => import('screens/Dashboard/practice/PracticeConnectedOrgDashboard')
)
const InternalUserDashboard = lazy(
  () => import('screens/Dashboard/InternalUserDashboard/InternalDashboard')
)
const PatientOrderView = lazy(
  () => import('screens/PatientDetailsOverview.tsx/pages/PatientOrderView')
)
const OnboardingCallScreen = lazy(() => import('screens/Dashboard/dashboard/OnboardingCallScreen'))
const StarterPlanUserDashboard = lazy(
  () => import('../screens/Dashboard/StarterPlanUserDashboard/StarterPlanUserDashboard')
)
const StarterPlanAddPatientStepper = lazy(
  () => import('screens/Patients/StarterPlanAddPatient/StarterPlanAddPatientStepper')
)
const StarterPlanProduction = lazy(
  () => import('screens/PatientDetailsOverview.tsx/tabs/StarterPlanProduction')
)
const PatientListV3 = lazy(() => import('screens/Patients/PatientListV3/patientlist'))

const PrivateRoutes = () => {
  const {userId, organizationId, profileId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const {subscriptionData} = useSubscriptionDetails()
  const isTrialExpiredModalOpen = isPlanExpired(subscriptionData) || false
  const isLabStaffDeactivated = subscriptionData?.is_lab_staff_deactivated
  const isDeleteRequested = subscriptionData?.plan_metadata?.request_deletion
  const {isAdmin} = useSubRoleDetails()
  useRefreshToken()
  useSubscriptionDetails()
  useSubRoleDetails(true)
  const renderLeadsProfileRoutes = (routes: any[]) => {
    return routes.map((route: any, index: number) =>
      (() => {
        const Component = route.component
        if (!Component) {
          // fallback to Notfound if mapping missing
          return (
            <Route key={index} path={route.path} element={<Notfound />}>
              {route.children && renderLeadsProfileRoutes(route.children)}
            </Route>
          )
        }
        return (
          <Route key={index} path={route.path} element={<Component />}>
            {route.children && renderLeadsProfileRoutes(route.children)}
          </Route>
        )
      })()
    )
  }

  const renderPatientProfileRoutes = (routes: any[]) => {
    return routes.map((route: any, index: number) =>
      (() => {
        const Component = route.component
        if (!Component) {
          // fallback to Notfound if mapping missing
          return (
            <Route key={index} path={route.path} element={<Notfound />}>
              {route.children && renderPatientProfileRoutes(route.children)}
            </Route>
          )
        }
        return (
          <Route key={index} path={route.path} element={<Component />}>
            {route.children && renderPatientProfileRoutes(route.children)}
          </Route>
        )
      })()
    )
  }

  const renderPracticeProfileRoutes = (routes: any[]) => {
    return routes.map((route: any, index: number) =>
      (() => {
        const Component = route.component
        if (!Component) {
          return (
            <Route key={index} path={route.path} element={<Notfound />}>
              {route.children && renderPracticeProfileRoutes(route.children)}
            </Route>
          )
        }
        return (
          <Route key={index} path={route.path} element={<Component />}>
            {route.children && renderPracticeProfileRoutes(route.children)}
          </Route>
        )
      })()
    )
  }

  const renderVspProfileRoutes = (routes: any[]) => {
    return routes.map((route: any, index: number) =>
      (() => {
        const Component = route.component
        if (!Component) {
          return (
            <Route key={index} path={route.path} element={<Notfound />}>
              {route.children && renderVspProfileRoutes(route.children)}
            </Route>
          )
        }
        return (
          <Route key={index} path={route.path} element={<Component />}>
            {route.children && renderVspProfileRoutes(route.children)}
          </Route>
        )
      })()
    )
  }

  useEffect(() => {
    if (userId && organizationId && profileId) {
      dispatchAction(
        getAccountData({
          doctorId: safeParseInt(userId),
          organizationId: safeParseInt(organizationId),
          profileId: safeParseInt(profileId),
        })
      )
    }
  }, [userId, organizationId, profileId])

  const {
    isDesignLabUser,
    isCustomer,
    isVendor,
    isEnterprisePlanUser,
    isPractice,
    isGrowthPlanUser,
    isInternalUser,
    isStarterPlanUser,
  } = useAllUserPlan()

  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)

  const DashboardBasedOnUserRole = () => {
    if (isTrialExpiredModalOpen || isLabStaffDeactivated || isDeleteRequested) {
      return (
        <>
          <When isTrue={isTrialExpiredModalOpen}>
            <PlanExpiry />
          </When>
          <When isTrue={isLabStaffDeactivated}>
            <LabStaffDeactivatedScreen />
          </When>
          <When isTrue={isDeleteRequested}>
            <RequestDeletion />
          </When>
        </>
      )
    }

    if (isStarterPlanUser) {
      return <StarterPlanUserDashboard />
    }
    if (isGrowthPlanUser) {
      return <GrowthPlanDashboard />
    }

    if (isEnterprisePlanUser || isAdmin) {
      return <EnterpriseAdminDashboard />
    }

    if (isPractice) {
      return <PracticeConnectedOrgDashboard />
    }

    if (isInternalUser) {
      return <InternalUserDashboard />
    }

    return <StarterPlanUserDashboard />
  }

  const dashboardElement = useCreation(
    () => DashboardBasedOnUserRole(),
    [
      isTrialExpiredModalOpen,
      isLabStaffDeactivated,
      isDeleteRequested,
      isDesignLabUser,
      isVendor,
      isEnterprisePlanUser,
      isCustomer,
      isStarterPlanUser,
      isGrowthPlanUser,
      isAdmin,
      isPractice,
      isInternalUser,
    ]
  )

  const SafeSelectTask = useCreation(() => SelectTaskManufacturingType || (() => <Notfound />), [])
  const SafeCustomPlanningSetup = useCreation(() => CustomPlanningSetup || (() => <Notfound />), [])
  const SafeProductionSetup = useCreation(() => ProductionSetupPage || (() => <Notfound />), [])
  const SafeProductionReview = useCreation(() => ProductionSetupReview || (() => <Notfound />), [])

  const standaloneRoutes = useCreation(
    () => [
      {path: 'health', element: <HealthCheck />},
      {path: 'brand-details', element: <ConfirmBrandingDetails />},
      {path: 'on-board-meeting', element: <OnboardingCallScreen />},
      {path: 'roles', element: <AddProfileSelectRole />},
      {path: '/:inviteId/connect', element: <ClearLocalStorageAndReload />},
      {path: '/summary/:patientId', element: <Summary />},
      {path: 'orders/create-order/:orderId?', element: <CreateOrderPage />},
      {path: 'customer/create-order/:orderId?', element: <CustomerCreateOrderPage />},
      {path: 'vsp/create-order/:orderId?', element: <VSPCreateOrderPage />},
      {path: 'smile-simulation', element: <SmileSimulation />},
      {
        path: '/add_patient/existing_case/:patientId?/:orderId?/:treatmentId?',
        element: <CreateExistingCase />,
      },
    ],
    []
  )

  const mainLayoutRoutes = useCreation(
    () => [
      {path: '', element: dashboardElement},
      {path: '/global-search', element: <GlobalSearchMobile />},
      {path: '/add-patient', element: <AddPatient />},
      {path: '/add-patient-starter', element: <StarterPlanAddPatientStepper />},
      {path: '/notifications', element: <NotificationsMobileView />},
      {
        path: '/settings/upgrade-renew-subscription',
        element: <UpgradeRenewalSubscriptionForm />,
      },
      {path: 'upgrade-plan', element: <PricingPage />},
      {path: 'chat-list/:id?', element: <Chat />},
      {path: 'lab-chat', element: <LabChat />},
      {
        path: 'patients-list',
        element:
          isPractice || serviceConfig?.PLANNING || serviceConfig?.VSP_PLANNING ? (
            <PatientListV3 />
          ) : (
            <PatientListParent />
          ),
      },
      {path: 'practice-location-list', element: <PracticeLocationList />},
      {path: 'archive', element: <ArchivePatientsList />},
      {path: 'production', element: <Production />},
      {path: 'aligner-production', element: <AlignerProduction />},
      {path: 'aligner-patient-analytics', element: <AlignerPatientAnalytics />},
      {path: 'orders', element: <OrdersPage />},
      {path: 'view-order/:orderId', element: <PatientOrderView />},
      {path: 'aligner-orders', element: <AlignerOrdersPage />},
      {path: 'unprocessed-orders', element: <UnprocessedOrders />},
      {path: 'calendar', element: <CalendarPage />},
      {path: 'billings', element: <BillingsAndPaymentsPage />},
      {path: 'practices', element: <PracticeList />},
      {path: 'practices-add/:practiceId?', element: <AddingPractice />},
      {path: 'labs', element: <LabList />},
      {path: 'labs-add/:labId?', element: <AddLabs />},
      {path: 'customers', element: <CustomerList />},
      {path: 'customers-add/:customerId?', element: <AddCustomer />},
      {
        path: '/:patientId/plans-list/new/setupTreatmentPlan',
        element: <SetupTreatmentPlanTwoPane />,
      },
      {
        path: '/:patientId/plans-list/edit/setupTreatmentPlan/:treatmentId',
        element: <SetupTreatmentPlanTwoPaneEditPlan />,
      },
      {path: 'aligner-tracking', element: <AlignerTracking />},
      {
        path: 'practice-profile/:customerId/*',
        element: <PracticeProfile />,
        children: renderPracticeProfileRoutes(practiceProfileRoutes),
      },
      {
        path: 'practice-lab-profile/:customerId/*',
        element: <PracticeLabProfile />,
        children: renderPracticeProfileRoutes(practiceProfileRoutes),
      },
      {path: 'customer-profile/:customerId', element: <CustomerProfile />},
      {
        path: 'settings',
        element: <SettingsPage />,
        children: renderLeadsProfileRoutes(settingsRoutes),
      },
      {
        path: 'rewards',
        element: <RewardsPage />,
      },
      {
        path: '/leads-profile/:patientId',
        element: <LeadsProfile />,
        children: renderLeadsProfileRoutes(leadsProfileRoutes),
      },
      {
        path: '/profile/:patientId',
        element: <PatientDetailsOverview />,
        children: renderPatientProfileRoutes([...profileRoutes, ...customerProfileRoutes]),
      },
      {
        path: '/vsp-profile/:patientId',
        element: <VspPatientProfile />,
        children: renderVspProfileRoutes(vspProfileRoutes),
      },
      {path: '/planning-setup-stepper/:patientId', element: <PlanningSetupStepper />},
      {path: '/production-setup-stepper/:patientId', element: <ProductionSetupStepper />},
      {
        path: '/production-setup-stepper/:patientId/:treatmentId',
        element: <ProductionSetupStepper />,
      },
      {path: '/custom-planning-setup/:patientId', element: <SafeCustomPlanningSetup />},
      {
        path: '/manufacturing-selection/:patientId/:treatmentId',
        element: <SafeSelectTask />,
      },
      {path: '/production-setup/:patientId/:treatmentId', element: <SafeProductionSetup />},
      {path: '/production-review/:patientId/:treatmentId', element: <SafeProductionReview />},
      {
        path: '/starter-plan-production/:patientId/:treatmentId',
        element: <StarterPlanProduction />,
      },
      {
        path: '/plan/:patientId/setup-treatment-plan/:treatmentId?',
        element: <SetupPlan />,
      },
      {
        path: '/plan/:patientId/view-treatment-plan/:treatmentId?',
        element: <ReviewTreatmentPlan />,
      },
      {path: '/case-records/:patientId', element: <CaseRecordsPage />},
      {path: 'orders/:orderId', element: <ViewOrderPage />},
      {path: 'add-access-control-user', element: <AddAccessControlUser />},
      {path: 'add-custom-role', element: <AddCustomRole />},
      {
        path: 'access-control/',
        element: <AccessControlUser />,
        children: (
          <>
            <Route index element={<AccessControlOverview />} />
            <Route path='users' element={<AccessControlUserList />} />
            <Route path='labs' element={<AccessControlLabsList />} />
            <Route path='audit-logs' element={<AccessControlAuditLogs />} />
            <Route path='roles' element={<AccessControlRoles />} />
          </>
        ),
      },
      {path: '*', element: <Notfound />},
    ],
    [
      dashboardElement,
      renderPracticeProfileRoutes,
      renderLeadsProfileRoutes,
      renderPatientProfileRoutes,
      renderVspProfileRoutes,
      serviceConfig?.PLANNING,
      serviceConfig?.VSP_PLANNING,
      isPractice,
    ]
  )

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {standaloneRoutes.map(({path, element}) => (
          <Route key={path} path={path} element={element} />
        ))}
        <Route element={<MainLayout />}>
          {mainLayoutRoutes.map(({path, element, children}) => (
            <Route key={path || 'index'} path={path} element={element}>
              {children}
            </Route>
          ))}
        </Route>
      </Routes>
    </Suspense>
  )
}

export {PrivateRoutes}
