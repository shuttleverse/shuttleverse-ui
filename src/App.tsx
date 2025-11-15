import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import OwnershipClaimPage from "@/pages/ownership-claim";
import { AuthProvider } from "@/contexts/AuthContext";
import { LocationProvider } from "@/contexts/LocationContext";
import { WebSocketProvider } from "@/contexts/WebSocketContext";
import { PushNotificationProvider } from "@/contexts/PushNotificationContext";
import { PushNotificationPrompt } from "@/components/push/PushNotificationPrompt";
import MapPage from "@/pages/map";
import AddPage from "@/pages/add";
import Profile from "@/pages/profile";
import Admin from "@/pages/admin";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsOfService from "@/pages/terms-of-service";
import ChatListPage from "@/pages/chat";
import ChatPage from "@/pages/chat-detail";
import { useScrollToTop } from "@/hooks/useScrollToTop";

const queryClient = new QueryClient();

const AppContent = () => {
  useScrollToTop();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="/add" element={<AddPage />} />
      <Route path="/courts" element={<Courts />} />
      <Route path="/courts/:id" element={<EntityDetailsPage />} />
      <Route path="/coaches" element={<Coaches />} />
      <Route path="/coaches/:id" element={<EntityDetailsPage />} />
      <Route path="/stringers" element={<Stringers />} />
      <Route path="/stringers/:id" element={<EntityDetailsPage />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/courts/add" element={<AddCourt />} />
        <Route path="/coaches/add" element={<AddCoach />} />
        <Route path="/stringers/add" element={<AddStringer />} />
        <Route path="/claim/:id" element={<OwnershipClaimPage />} />
        <Route path="/chat" element={<ChatListPage />} />
        <Route path="/chat/:chatId" element={<ChatPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PushNotificationProvider>
          <WebSocketProvider>
            <LocationProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <AppContent />
                  <PushNotificationPrompt />
                </BrowserRouter>
              </TooltipProvider>
            </LocationProvider>
          </WebSocketProvider>
        </PushNotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
