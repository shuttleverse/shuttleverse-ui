import { ReactNode, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ReactGA from "react-ga4";

interface GoogleAnalyticsProviderProps {
  children: ReactNode;
}

export const GoogleAnalyticsProvider = ({
  children,
}: GoogleAnalyticsProviderProps) => {
  const location = useLocation();
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  useEffect(() => {
    if (measurementId) {
      ReactGA.initialize(measurementId);
    }
  }, [measurementId]);

  useEffect(() => {
    if (measurementId) {
      ReactGA.send({
        hitType: "pageview",
        page: location.pathname + location.search,
      });
    }
  }, [location, measurementId]);

  return <>{children}</>;
};
