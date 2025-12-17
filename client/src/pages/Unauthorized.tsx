const Unauthorized = () => {
  return (
    <div className="container-main py-6">
      <div className="space-y-6">
        <div className="card w-full max-w-md mx-auto text-center">
          <h2 className="text-2xl font-semibold mb-2">Unauthorized</h2>
          <p className="text-sm text-muted">You do not have permission to view this page.</p>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
