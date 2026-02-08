import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "@/pages/HomePage";
import { PetitionPage } from "@/pages/PetitionPage";
import { CreatePetitionPage } from "@/pages/CreatePetitionPage";
import { Layout } from "@/components/layout/Layout";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/Petition/:slug" element={<PetitionPage />} />
          <Route path="/CreatePetition" element={<CreatePetitionPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
