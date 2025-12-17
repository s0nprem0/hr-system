import PageContainer from '../components/layout/PageContainer';

const Unauthorized = () => {
  return (
    <PageContainer>
      <div className="card w-full max-w-md mx-auto text-center">
        <h2 className="text-2xl font-semibold mb-2">Unauthorized</h2>
        <p className="text-sm text-muted">You do not have permission to view this page.</p>
      </div>
    </PageContainer>
  );
};

export default Unauthorized;
