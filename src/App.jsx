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
import BalanceAmount from './components/BalanceAmount';

import { useData } from './context/DataContext';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { loading } = useData();

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
        return <Production />;
      case 'expenses':
        return <Expenses />;
      case 'employees':
        return <Employees />;
      case 'customers':
        return <Customers />;
      case 'stats':
        return <Stats />;
      case 'analysis':
        return <Analysis />;
      case 'lastbuy':
        return <LastBuy />;
      case 'compare':
        return <Compare />;
      case 'orders':
        return <Orders />;
      case 'balance':
        return <BalanceAmount />;
      default:
        return <Dashboard />;
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}

export default App;
