import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ConfirmationProvider } from "./contexts/ConfirmationContext";
import { AppRoutes } from "./routes/AppRoutes";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <AuthProvider>
      <ConfirmationProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster />
        </BrowserRouter>
      </ConfirmationProvider>
    </AuthProvider>
  );
}

export default App;
