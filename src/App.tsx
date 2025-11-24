import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ThemeProvider } from './components/ThemeContext';
import { Layout } from './components/Layout';
import { Login } from './features/auth/Login';
import { Register } from './features/auth/Register';
import { Home } from './features/dashboard/Home';
import { Settings } from './features/settings/Settings';
import { DataSourceView } from './views/DataSourceView';
import { MappingView } from './views/MappingView';
import { NormalizationView } from './views/NormalizationView';
import { ReconciliationView } from './views/ReconciliationView';
import { ReportView } from './views/ReportView';
import { useAppStore } from './store/appStore';

function AppContent() {
  // Get state and actions from Zustand store
  const currentView = useAppStore((state) => state.currentView);
  const files = useAppStore((state) => state.files);
  const mappings = useAppStore((state) => state.mappings);
  const results = useAppStore((state) => state.results);
  const strategy = useAppStore((state) => state.strategy);

  const setCurrentView = useAppStore((state) => state.setCurrentView);
  const addFiles = useAppStore((state) => state.addFiles);
  const removeFile = useAppStore((state) => state.removeFile);
  const swapFiles = useAppStore((state) => state.swapFiles);
  const setMappings = useAppStore((state) => state.setMappings);
  const setNormalizedData = useAppStore((state) => state.setNormalizedData);
  const setStrategy = useAppStore((state) => state.setStrategy);
  const runReconciliation = useAppStore((state) => state.runReconciliation);
  const getStepsStatus = useAppStore((state) => state.getStepsStatus);

  const stepsStatus = getStepsStatus();

  const handleFilesUploaded = (newFiles: any[]) => {
    addFiles(newFiles);
  };

  const handleRemoveFile = (id: string) => {
    removeFile(id);
  };

  const handleSwapFiles = () => {
    swapFiles();
  };

  const handleRunReconciliation = () => {
    runReconciliation();
    setCurrentView('reconciliation');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return <Home />;
      case 'datasource':
        return (
          <DataSourceView
            files={files}
            onFilesUploaded={handleFilesUploaded}
            onRemoveFile={handleRemoveFile}
            onSwapFiles={handleSwapFiles}
            onNext={() => setCurrentView('mapping')}
            canProceed={stepsStatus.datasource}
          />
        );
      case 'mapping':
        return (
          <MappingView
            sourceFile={files[0]}
            targetFile={files[1]}
            strategy={strategy}
            onMappingChange={setMappings}
            onStrategyChange={setStrategy}
            onNext={() => setCurrentView('normalization')}
            onRunReconciliation={handleRunReconciliation}
            canProceed={stepsStatus.mapping}
          />
        );
      case 'normalization':
        return (
          <NormalizationView
            sourceFile={files[0]}
            targetFile={files[1]}
            mappings={mappings}
            onNormalizationComplete={setNormalizedData}
          />
        );
      case 'reconciliation':
        return (
          <ReconciliationView
            results={results}
            mappings={mappings}
            onViewReport={() => setCurrentView('report')}
          />
        );
      case 'report':
        return <ReportView results={results} />;
      case 'settings':
        return <Settings />;
      default:
        return <Home />;
    }
  };

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView} stepsStatus={stepsStatus}>
      {renderContent()}
    </Layout>
  );
}

function App() {
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  const AuthFallback = () => {
    if (authView === 'login') {
      return (
        <Login
          onSwitchToRegister={() => setAuthView('register')}
          onLoginSuccess={() => {
            // After login, the ProtectedRoute will automatically show the app
          }}
        />
      );
    }

    return (
      <Register
        onSwitchToLogin={() => setAuthView('login')}
        onRegisterSuccess={() => {
          // After register, the ProtectedRoute will automatically show the app
        }}
      />
    );
  };

  return (
    <AuthProvider>
      <ThemeProvider>
        <ProtectedRoute fallback={<AuthFallback />}>
          <AppContent />
        </ProtectedRoute>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
