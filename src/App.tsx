import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "@/pages/index";
import Login from "@/pages/login";
import Clubs from "@/pages/clubs";
import Courts from "@/pages/courts";
import AddCourt from "@/pages/add-court";
import Coaches from "@/pages/coaches";
import AddCoach from "@/pages/add-coach";
import Stringers from "@/pages/stringers";
import AddStringer from "@/pages/add-stringer";
import ClubDetail from "@/pages/club-detail";
import NotFound from "@/pages/not-found";
import ProtectedRoute from "@/components/protected-routes";
import Home from "@/pages/home";
import Onboarding from "@/pages/onboarding";
import { AuthProvider } from "@/contexts/AuthContext";

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
              <Route element={<ProtectedRoute />}>
                <Route path="/home" element={<Home />} />
                <Route path="/clubs" element={<Clubs />} />
                <Route path="/courts" element={<Courts />} />
                <Route path="/courts/add" element={<AddCourt />} />
                <Route path="/coaches" element={<Coaches />} />
                <Route path="/coaches/add" element={<AddCoach />} />
                <Route path="/stringers" element={<Stringers />} />
                <Route path="/stringers/add" element={<AddStringer />} />
                <Route path="/clubs/:id" element={<ClubDetail />} />
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
