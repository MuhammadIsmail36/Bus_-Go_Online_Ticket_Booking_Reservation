import { useLocation } from 'wouter';
import Layout from '@/components/Layout';

/**
 * Not Found Page - 404 Error
 * Modern Transit Minimalism Design
 */

export default function NotFound() {
  const [, navigate] = useLocation();

  return (
    <Layout>
      <section className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-background py-12">
        <div className="text-center max-w-md">
          <i className="fas fa-exclamation-triangle text-6xl text-accent mb-4"></i>
          <h1 className="text-4xl font-bold text-primary mb-2">404</h1>
          <h2 className="text-2xl font-bold text-foreground mb-4">Page Not Found</h2>
          <p className="text-muted-foreground mb-8">
            Sorry, the page you're looking for doesn't exist. It might have been moved or deleted.
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn-accent"
          >
            <i className="fas fa-home mr-2"></i>
            Go to Home
          </button>
        </div>
      </section>
    </Layout>
  );
}
