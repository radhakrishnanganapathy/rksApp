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

import { useData } from './context/DataContext';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { loading, sales, orders, production, expenses } = useData();

  const renderContent = () => {
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
      if (activeTab !== 'dashboard') {
        setActiveTab('more'); // Default back behavior for tabs
      }
    }}>
      <BackupManager />
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        {renderContent()}
      </Layout>
    </GestureHandler>
  );
}

export default App;
