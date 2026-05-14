import { createBrowserRouter, Outlet } from "react-router-dom";

import Layout from "./components/layout/Layout";
import HomePage from "./pages/HomePage";
import { RoleGuard } from "./components/auth/RoleGuard";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import VerifyOtpPage from "./pages/VerifyOtpPage";
import ProfilePage from "./pages/ProfilePage";
import StudyMaterialsPage from "./pages/StudyMaterialsPage";
import StudyStockPage from "./pages/StudyStockPage";
import ImpQuestionsPage from "./pages/ImpQuestionsPage";
import SamplePapersPage from "./pages/SamplePapersPage";
import AddStudyContentPage from "./pages/AddStudyContentPage";
import SyllabusPage from "./pages/SyllabusPage";
import AdminLayout from "./layouts/AdminLayout";
import DashboardPage from "./pages/admin/DashboardPage";
import StudentsPage from "./pages/admin/StudentsPage";
import ResourceManagerPage from "./pages/admin/ResourceManagerPage";
import SyllabusManagerPage from "./pages/admin/SyllabusManagerPage";
import ImpQuestionsManagerPage from "./pages/admin/ImpQuestionsManagerPage";
import SamplePapersManagerPage from "./pages/admin/SamplePapersManagerPage";
import FacultyManager from "./pages/admin/FacultyManager";
import ContentApprovalPage from "./pages/admin/ContentApprovalPage";
import FacultyDashboard from "./pages/dashboard/FacultyDashboard";
import FacultyLayout from "./layouts/FacultyLayout";


import FeedbackPage from "./pages/FeedbackPage";
import HowToUsePage from "./pages/HowToUsePage";
import FeedbackManagerPage from "./pages/admin/FeedbackManagerPage";
import SearchPage from "./pages/SearchPage";

import ErrorPage from "./pages/ErrorPage";

const GlobalLayout = () => {
    return (
        <>
            <Outlet />
        </>
    );
};

export const router = createBrowserRouter([
    {
        element: <GlobalLayout />,
        children: [
            {
                path: "/",
                element: <Layout />,
                errorElement: <ErrorPage />,
                children: [
                    {
                        path: "/",
                        element: <RoleGuard><HomePage /></RoleGuard>,
                    },
                    {
                        path: "/resources",
                        children: [
                            {
                                index: true,
                                element: <StudyMaterialsPage />, // Acts as wrapper or redirect
                            },
                            {
                                path: ":branch/:semester",
                                element: <StudyMaterialsPage />, // We will handle state inside
                            },
                            {
                                path: ":branch/:semester/:subjectId",
                                element: <StudyMaterialsPage />, // Shared layout, internal switching
                            },
                            {
                                path: ":branch/:semester/:subjectId/topic/:topicId",
                                element: <StudyMaterialsPage />,
                            },
                        ]
                    },
                    {
                        path: "/study-stock",
                        element: <StudyStockPage />,
                    },
                    {
                        path: "/study-material/imp-questions",
                        element: <ImpQuestionsPage />,
                    },
                    {
                        path: "/study-material/sample-papers",
                        element: <SamplePapersPage />,
                    },
                    {
                        path: "/syllabus",
                        element: <SyllabusPage />,
                    },
                    {
                        path: "/add-study-content",
                        element: <AddStudyContentPage />,
                    },
                    {
                        path: "/profile",
                        element: <ProfilePage />,
                    },
                    {
                        path: "/search",
                        element: <SearchPage />,
                    },
                    {
                        path: "/feedback",
                        element: <FeedbackPage />,
                    },
                    {
                        path: "/how-to-use",
                        element: <HowToUsePage />,
                    },
                ],
            },
            {
                path: "/login",
                element: <LoginPage />,
                errorElement: <ErrorPage />,
            },
            {
                path: "/signup",
                element: <SignUpPage />,
                errorElement: <ErrorPage />,
            },
            {
                path: "/verify-otp",
                element: <VerifyOtpPage />,
                errorElement: <ErrorPage />,
            },

            {
                path: "/admin",
                element: <AdminLayout />,
                errorElement: <ErrorPage />,
                children: [
                    {
                        path: "dashboard",
                        element: <DashboardPage />,
                    },
                    {
                        path: "syllabus",
                        element: <SyllabusManagerPage />,
                    },
                    {
                        path: "resources",
                        element: <ResourceManagerPage />,
                    },
                    {
                        path: "imp-questions",
                        element: <ImpQuestionsManagerPage />,
                    },
                    {
                        path: "sample-papers",
                        element: <SamplePapersManagerPage />,
                    },
                    {
                        path: "students",
                        element: <StudentsPage />,
                    },
                    {
                        path: "approvals",
                        element: <ContentApprovalPage />,
                    },
                    {
                        path: "faculty",
                        element: <FacultyManager />,
                    },
                    {
                        path: "feedback",
                        element: <FeedbackManagerPage />,
                    },
                    {
                        path: "",
                        element: <DashboardPage />, // Default redirect
                    }
                ],
            },
            {
                path: "/dashboard/faculty",
                element: <FacultyLayout />,
                errorElement: <ErrorPage />,
                children: [
                    {
                        index: true,
                        element: <FacultyDashboard />,
                    }
                ]
            },
        ]
    },
]);
