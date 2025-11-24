import { useState } from 'react';
import { ThemeProvider } from './components/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';
import { Home } from './features/dashboard/Home';
import { Settings } from './features/settings/Settings';
import { DataSourceView } from './views/DataSourceView';
import { MappingView } from './views/MappingView';
import { NormalizationView } from './views/NormalizationView';
import { ReconciliationView } from './views/ReconciliationView';
import { ReportView } from './views/ReportView';
import { useReconciliation } from './hooks/useReconciliation';
import type { View } from './components/Sidebar';

function App() {
  const [currentView, setCurrentView] = useState<View>('home');

  const {
    files,
    mappings,
    results,
    strategy,
    handleFilesUploaded,
    handleRemoveFile,
    handleSwapFiles,
    setMappings,
    setNormalizedData,
    setStrategy,
    runReconciliation,
    getStepsStatus,
  } = useReconciliation();

  const stepsStatus = getStepsStatus();

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
    <ErrorBoundary>
      <ThemeProvider>
        <Layout currentView={currentView} onNavigate={setCurrentView} stepsStatus={stepsStatus}>
          {renderContent()}
        </Layout>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
