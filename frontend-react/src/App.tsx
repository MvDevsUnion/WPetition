import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "@/pages/HomePage";
import { PetitionPage } from "@/pages/PetitionPage";
import { CreatePetitionPage } from "@/pages/CreatePetitionPage";
import { AdminLoginPage } from "@/pages/AdminLoginPage";
import { AdminDashboardPage } from "@/pages/AdminDashboardPage";
import { Layout } from "@/components/layout/Layout";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/Petition/:slug" element={<PetitionPage />} />
          <Route path="/CreatePetition" element={<CreatePetitionPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
