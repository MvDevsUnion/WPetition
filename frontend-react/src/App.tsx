import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "@/pages/HomePage";
import { PetitionPage } from "@/pages/PetitionPage";
import { CreatePetitionPage } from "@/pages/CreatePetitionPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/Petition/:slug" element={<PetitionPage />} />
        <Route path="/CreatePetition" element={<CreatePetitionPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
