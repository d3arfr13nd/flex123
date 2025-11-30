import React from 'react';
import { ConfigProvider } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRouter } from './router/AppRouter';
import { antThemeConfig } from './theme/antThemeConfig';
import dayjs from 'dayjs';
import 'dayjs/locale/en';

dayjs.locale('en');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={antThemeConfig}>
        <AppRouter />
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;

