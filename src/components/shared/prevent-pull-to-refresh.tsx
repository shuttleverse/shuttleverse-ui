import React, { useEffect } from "react";

interface PreventPullToRefreshProps {
  children: React.ReactNode;
}

const PreventPullToRefresh: React.FC<PreventPullToRefreshProps> = ({
  children,
}) => {
  useEffect(() => {
    const disablePullToRefresh = (e: TouchEvent) => {
      e.preventDefault();
    };

    document.addEventListener("touchmove", disablePullToRefresh, {
      passive: false,
    });

    return () => {
      document.removeEventListener("touchmove", disablePullToRefresh);
    };
  }, []);

  return <div style={{ touchAction: "none" }}>{children}</div>;
};

export default PreventPullToRefresh;
