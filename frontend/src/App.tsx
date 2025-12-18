import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { queryClientConfig } from './lib/apiClient';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Decisions from './pages/Decisions';
import DecisionEntryForm from './pages/DecisionEntryForm';
import DecisionDetail from './pages/DecisionDetail';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient(queryClientConfig);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="decisions" element={<Decisions />} />
            <Route path="decisions/new" element={<DecisionEntryForm />} />
            <Route path="decisions/:id" element={<DecisionDetail />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
