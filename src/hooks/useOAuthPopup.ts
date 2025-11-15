export function useOAuthPopup() {
  const openOAuthPopup = () => {
    // Direct redirect to OAuth login (no popup)
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/login`;
  };

  return {
    openOAuthPopup,
    isPopupOpen: false, // Always false since we're not using popups
  };
}
