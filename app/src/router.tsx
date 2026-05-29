import { createBrowserRouter, Outlet } from "react-router-dom";

import Layout from "./components/layout/Layout";
import HomePage from "./pages/HomePage";
import { RoleGuard } from "./components/auth/RoleGuard";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import VerifyOtpPage from "./pages/VerifyOtpPage";
import StudyMaterialsPage from "./pages/StudyMaterialsPage";
import StudyStockPage from "./pages/StudyStockPage";
import ImpQuestionsPage from "./pages/ImpQuestionsPage";
import SamplePapersPage from "./pages/SamplePapersPage";
import AddStudyContentPage from "./pages/AddStudyContentPage";
import SyllabusPage from "./pages/SyllabusPage";

import StudentLayout from "./layouts/StudentLayout";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentProfilePage from "./pages/student/StudentProfilePage";
import StudentUploadsPage from "./pages/student/StudentUploadsPage";
import StudentAddContentPage from "./pages/student/StudentAddContentPage";
import StudentBookmarksPage from "./pages/student/StudentBookmarksPage";
import StudentNotesPage from "./pages/student/StudentNotesPage";

import AdminLayout from "./layouts/AdminLayout";
import DashboardPage from "./pages/admin/DashboardPage";
import StudentsPage from "./pages/admin/StudentsPage";
import ResourceManagerPage from "./pages/admin/ResourceManagerPage";
import SyllabusManagerPage from "./pages/admin/SyllabusManagerPage";
import ImpQuestionsManagerPage from "./pages/admin/ImpQuestionsManagerPage";
import SamplePapersManagerPage from "./pages/admin/SamplePapersManagerPage";
import FacultyManager from "./pages/admin/FacultyManager";
import ContentApprovalPage from "./pages/admin/ContentApprovalPage";
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import FacultyLayout from "./layouts/FacultyLayout";
import FacultyAddMaterial from "./pages/faculty/FacultyAddMaterial";
import FacultyProfile from "./pages/faculty/FacultyProfile";


import FeedbackPage from "./pages/FeedbackPage";
import HowToUsePage from "./pages/HowToUsePage";
import FeedbackManagerPage from "./pages/admin/FeedbackManagerPage";
import SearchPage from "./pages/SearchPage";
import NotesPage from "./pages/NotesPage";
import TopicEditorPage from "./pages/admin/TopicEditorPage";

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
                        path: "/notes",
                        element: <NotesPage />,
                    },
                    {
                        path: "/profile",
                        element: <StudentLayout />, // We can redirect or just keep it as an alias for now, but let's redirect
                        children: [
                            {
                                index: true,
                                element: <StudentDashboard />,
                            }
                        ]
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
                        path: "topics/:topicId/edit",
                        element: <TopicEditorPage />,
                    },
                    {
                        path: "",
                        element: <HomePage/>, // Default redirect
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
                    },
                    {
                        path: "upload",
                        element: <FacultyAddMaterial />,
                    },
                    {
                        path: "profile",
                        element: <FacultyProfile />,
                    }
                ]
            },
            {
                path: "/dashboard/student",
                element: <StudentLayout />,
                errorElement: <ErrorPage />,
                children: [
                    {
                        index: true,
                        element: <StudentDashboard />,
                    },
                    {
                        path: "profile",
                        element: <StudentProfilePage />,
                    },
                    {
                        path: "uploads",
                        element: <StudentUploadsPage />,
                    },
                    {
                        path: "add-content",
                        element: <StudentAddContentPage />,
                    },
                    {
                        path: "bookmarks",
                        element: <StudentBookmarksPage />,
                    },
                    {
                        path: "notes",
                        element: <StudentNotesPage />,
                    },
                ]
            },
        ]
    },
]);
