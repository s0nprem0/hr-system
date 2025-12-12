const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Unauthorized</h2>
        <p className="text-sm text-muted">You do not have permission to view this page.</p>
      </div>
    </div>
  );
};

export default Unauthorized;
