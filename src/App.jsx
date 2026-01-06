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

import Products from './components/Products';
import PreviousMonthStock from './components/PreviousMonthStock';
import ReminderSettings from './components/ReminderSettings';

// Farm Components
import FarmDashboard from './components/FarmDashboard';
import FarmExpenses from './components/FarmExpenses';
import FarmIncome from './components/FarmIncome';
import FarmMore from './components/FarmMore';
import Cultivation from './components/Cultivation';
import Harvesting from './components/Harvesting';
import CropMaster from './components/CropMaster';
import FarmExpenseCategories from './components/FarmExpenseCategories';
import Timeline from './components/Timeline';
// Home Components
import HomeDashboard from './components/Home/HomeDashboard';
import HomeIncome from './components/Home/HomeIncome';
import HomeExpenses from './components/Home/HomeExpenses';
import HomeMore from './components/Home/HomeMore';
import HomeExpenseMaster from './components/Home/HomeExpenseMaster';
import HomeLoans from './components/Home/HomeLoans';
import HomeSavings from './components/Home/HomeSavings';
import HomeEMICalculator from './components/Home/HomeEMICalculator';
import HomeCountdown from './components/Home/HomeCountdown';

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
        case 'cultivation':
          return <Cultivation onNavigateBack={() => setActiveTab('more')} />;
        case 'harvesting':
          return <Harvesting onNavigateBack={() => setActiveTab('more')} />;
        case 'crop-master':
          return <CropMaster onNavigateBack={() => setActiveTab('more')} />;
        case 'timeline':
          return <Timeline onNavigateBack={() => setActiveTab('more')} />;
        case 'farm-categories':
          return <FarmExpenseCategories onNavigateBack={() => setActiveTab('more')} />;
        case 'reminder-settings':
          return <ReminderSettings onNavigateBack={() => setActiveTab('more')} />;
        default:
          return <FarmDashboard />;
      }
    }

    // Home Module (Personal Finance)
    if (businessMode === 'home') {
      switch (activeTab) {
        case 'dashboard':
          return <HomeDashboard />;
        case 'income':
          return <HomeIncome onNavigateBack={() => setActiveTab('dashboard')} />;
        case 'expenses':
          return <HomeExpenses onNavigateBack={() => setActiveTab('dashboard')} />;
        case 'expense-master':
          return <HomeExpenseMaster onNavigateBack={() => setActiveTab('more')} />;
        case 'loans':
          return <HomeLoans onNavigateBack={() => setActiveTab('more')} />;
        case 'savings':
          return <HomeSavings onNavigateBack={() => setActiveTab('more')} />;
        case 'emi-calculator':
          return <HomeEMICalculator onNavigateBack={() => setActiveTab('more')} />;
        case 'countdowns':
          return <HomeCountdown onNavigateBack={() => setActiveTab('more')} />;
        case 'more':
          return <HomeMore onNavigate={setActiveTab} />;
        case 'reminder-settings':
          return <ReminderSettings onNavigateBack={() => setActiveTab('more')} />;
        default:
          return <HomeDashboard />;
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
      case 'previous-month-stock':
        return <PreviousMonthStock onNavigateBack={() => setActiveTab('more')} />;
      case 'reminder-settings':
        return <ReminderSettings onNavigateBack={() => setActiveTab('more')} />;
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
      const farmTabs = ['expenses', 'income', 'cultivation', 'harvesting', 'crop-master', 'timeline', 'farm-categories', 'reminder-settings'];
      const homeSnacksTabs = ['production', 'expenses', 'employees', 'customers', 'stats',
        'analysis', 'lastbuy', 'compare', 'orders', 'balance',
        'raw-material-prices', 'data-management', 'products', 'previous-month-stock', 'reminder-settings'];
      const homeTabs = ['income', 'expenses', 'expense-master', 'loans', 'emi-calculator', 'reminder-settings'];

      if (businessMode === 'farm' && farmTabs.includes(activeTab)) {
        setActiveTab('more');
      } else if (businessMode === 'home' && homeTabs.includes(activeTab)) {
        setActiveTab('more');
      } else if (businessMode === 'homesnacks' && homeSnacksTabs.includes(activeTab)) {
        setActiveTab('more');
      } else if (activeTab !== 'dashboard') {
        setActiveTab('dashboard');
      }
    }}>

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
