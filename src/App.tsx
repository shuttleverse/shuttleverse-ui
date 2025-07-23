import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "@/pages/index";
import Login from "@/pages/login";
import Courts from "@/pages/courts";
import AddCourt from "@/pages/add-court";
import Coaches from "@/pages/coaches";
import AddCoach from "@/pages/add-coach";
import Stringers from "@/pages/stringers";
import AddStringer from "@/pages/add-stringer";
import NotFound from "@/pages/not-found";
import ProtectedRoute from "@/components/protected-routes";
import Home from "@/pages/home";
import Onboarding from "@/pages/onboarding";
import EntityDetailsPage from "@/pages/entity-details";
import { AuthProvider } from "@/contexts/AuthContext";
import MapPage from "@/pages/map";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/home" element={<Home />} />
              <Route path="/courts" element={<Courts />} />
              <Route path="/courts/:id" element={<EntityDetailsPage />} />
              <Route path="/coaches" element={<Coaches />} />
              <Route path="/coaches/:id" element={<EntityDetailsPage />} />
              <Route path="/stringers" element={<Stringers />} />
              <Route path="/stringers/:id" element={<EntityDetailsPage />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/courts/add" element={<AddCourt />} />
                <Route path="/coaches/add" element={<AddCoach />} />
                <Route path="/stringers/add" element={<AddStringer />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
