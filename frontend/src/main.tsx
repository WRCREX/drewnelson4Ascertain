import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./index.css";
import { Layout } from "./components/Layout";
import { styles } from "./styles";

// route-level code splitting: each page ships as its own chunk
const Dashboard = lazy(() => import("./pages/Dashboard").then((m) => ({ default: m.Dashboard })));
const Patients = lazy(() => import("./pages/Patients").then((m) => ({ default: m.Patients })));
const PatientDetail = lazy(() => import("./pages/PatientDetail").then((m) => ({ default: m.PatientDetail })));
const PatientCreate = lazy(() => import("./pages/PatientCreate").then((m) => ({ default: m.PatientCreate })));
const PatientEdit = lazy(() => import("./pages/PatientEdit").then((m) => ({ default: m.PatientEdit })));
const NotFound = lazy(() => import("./pages/NotFound").then((m) => ({ default: m.NotFound })));

// single QueryClient instance: sane staleTime so navigation back to the list is instant
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
  },
});

function page(el: React.ReactNode) {
  return <Suspense fallback={<div className={styles.spinner}>Loading...</div>}>{el}</Suspense>;
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: page(<Dashboard />) },
      { path: "/patients", element: page(<Patients />) },
      { path: "/patients/new", element: page(<PatientCreate />) },
      { path: "/patients/:id", element: page(<PatientDetail />) },
      { path: "/patients/:id/edit", element: page(<PatientEdit />) },
      { path: "*", element: page(<NotFound />) },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
);
