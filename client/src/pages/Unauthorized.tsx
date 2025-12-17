import PageContainer from '../components/layout/PageContainer';
import { CenteredCard } from '../components/ui';

const Unauthorized = () => {
  return (
    <PageContainer>
      <CenteredCard>
        <h2 className="text-2xl font-semibold mb-2">Unauthorized</h2>
        <p className="text-sm text-muted">You do not have permission to view this page.</p>
      </CenteredCard>
    </PageContainer>
  );
};

export default Unauthorized;
