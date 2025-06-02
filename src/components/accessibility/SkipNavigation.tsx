
const SkipNavigation = () => {
  return (
    <div className="sr-only focus-within:not-sr-only">
      <a 
        href="#main-content"
        className="fixed top-4 left-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all"
      >
        Skip to main content
      </a>
      <a 
        href="#navigation"
        className="fixed top-4 left-40 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all"
      >
        Skip to navigation
      </a>
    </div>
  );
};

export default SkipNavigation;
