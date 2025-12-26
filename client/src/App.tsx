import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import SearchResults from "@/pages/SearchResults";
import BusDetails from "@/pages/BusDetails";
import PassengerDetails from "@/pages/PassengerDetails";
import BookingConfirmation from "@/pages/BookingConfirmation";
import MyBookings from "@/pages/MyBookings";
import Admin from "@/pages/Admin";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

/**
 * Bus Reservation Application - Modern Transit Minimalism Design
 * Main router with all pages
 */

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
      <Route path={"/register"} component={Register} />
      <Route path={"/search-results"} component={SearchResults} />
      <Route path={"/bus-details"} component={BusDetails} />
      <Route path={"/passenger-details"} component={PassengerDetails} />
      <Route path={"/booking-confirmation"} component={BookingConfirmation} />
      <Route path={"/my-bookings"} component={MyBookings} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
