import React, { useState } from 'react';

import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Billing from './components/Billing';
import Stock from './components/Stock';
import Production from './components/Production';
import Expenses from './components/Expenses';
import More from './components/More';
import Employees from './components/Employees';
import Customers from './components/Customers';
import Analysis from './components/Analysis';
import Stats from './components/Stats';
import LoadingScreen from './components/LoadingScreen';
import LastBuy from './components/LastBuy';
import Compare from './components/Compare';
import Orders from './components/Orders';
import RawMaterialPrices from './components/RawMaterialPrices';
import DataManagement from './components/DataManagement';
import BalanceAmount from './components/BalanceAmount';
import GestureHandler from './components/GestureHandler';
import BackupManager from './components/BackupManager';
import Products from './components/Products';

// Farm Components
import FarmDashboard from './components/FarmDashboard';
import FarmExpenses from './components/FarmExpenses';
import FarmIncome from './components/FarmIncome';
import FarmMore from './components/FarmMore';
import Crops from './components/Crops';
import FarmExpenseCategories from './components/FarmExpenseCategories';
import Timeline from './components/Timeline';

import { useData } from './context/DataContext';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [businessMode, setBusinessMode] = useState('homesnacks'); // 'homesnacks' or 'farm'
  const { loading } = useData();

  // Reset to dashboard when switching business modes
  const handleBusinessModeChange = (mode) => {
    setBusinessMode(mode);
    setActiveTab('dashboard');
  };

  const renderContent = () => {
    // Farm Module
    if (businessMode === 'farm') {
      switch (activeTab) {
        case 'dashboard':
          return <FarmDashboard />;
        case 'expenses':
          return <FarmExpenses onNavigateBack={() => setActiveTab('dashboard')} />;
        case 'income':
          return <FarmIncome onNavigateBack={() => setActiveTab('dashboard')} />;
        case 'more':
          return <FarmMore onNavigate={setActiveTab} />;
        case 'crops':
          return <Crops onNavigateBack={() => setActiveTab('more')} />;
        case 'timeline':
          return <Timeline onNavigateBack={() => setActiveTab('more')} />;
        case 'farm-categories':
          return <FarmExpenseCategories onNavigateBack={() => setActiveTab('more')} />;
        default:
          return <FarmDashboard />;
      }
    }

    // HomeSnacks Module (existing)
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'sales':
        return <Billing />;
      case 'stock':
        return <Stock />;
      case 'more':
        return <More onNavigate={setActiveTab} />;
      case 'production':
        return <Production onNavigateBack={() => setActiveTab('more')} />;
      case 'expenses':
        return <Expenses onNavigateBack={() => setActiveTab('more')} />;
      case 'employees':
        return <Employees onNavigateBack={() => setActiveTab('more')} />;
      case 'customers':
        return <Customers onNavigateBack={() => setActiveTab('more')} />;
      case 'stats':
        return <Stats onNavigateBack={() => setActiveTab('more')} />;
      case 'analysis':
        return <Analysis onNavigateBack={() => setActiveTab('more')} />;
      case 'lastbuy':
        return <LastBuy onNavigateBack={() => setActiveTab('more')} />;
      case 'compare':
        return <Compare onNavigateBack={() => setActiveTab('more')} />;
      case 'orders':
        return <Orders onNavigateBack={() => setActiveTab('more')} />;
      case 'balance':
        return <BalanceAmount onNavigateBack={() => setActiveTab('more')} />;
      case 'raw-material-prices':
        return <RawMaterialPrices onNavigateBack={() => setActiveTab('more')} />;
      case 'data-management':
        return <DataManagement onNavigateBack={() => setActiveTab('more')} />;
      case 'products':
        return <Products onNavigateBack={() => setActiveTab('more')} />;
      default:
        return <Dashboard />;
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <GestureHandler onBack={() => {
      // Simple history back or tab navigation logic
      const farmTabs = ['expenses', 'income', 'crops', 'farm-categories'];
      const homeSnacksTabs = ['production', 'expenses', 'employees', 'customers', 'stats',
        'analysis', 'lastbuy', 'compare', 'orders', 'balance',
        'raw-material-prices', 'data-management', 'products'];

      if (businessMode === 'farm' && farmTabs.includes(activeTab)) {
        setActiveTab('more');
      } else if (businessMode === 'homesnacks' && homeSnacksTabs.includes(activeTab)) {
        setActiveTab('more');
      } else if (activeTab !== 'dashboard') {
        setActiveTab('dashboard');
      }
    }}>
      <BackupManager />
      <Layout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        businessMode={businessMode}
        setBusinessMode={handleBusinessModeChange}
      >
        {renderContent()}
      </Layout>
    </GestureHandler>
  );
}

export default App;
