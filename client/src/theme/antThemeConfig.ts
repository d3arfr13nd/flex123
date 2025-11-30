import { ThemeConfig } from 'antd';

export const antThemeConfig: ThemeConfig = {
  token: {
    colorPrimary: '#1677FF',
    colorSuccess: '#52c41a',
    colorError: '#ff4d4f',
    colorWarning: '#faad14',
    colorInfo: '#13C2C2',
    borderRadius: 6,
    wireframe: false,
  },
  components: {
    Card: {
      borderRadius: 8,
      paddingLG: 24,
    },
    Button: {
      borderRadius: 6,
    },
    Input: {
      borderRadius: 6,
    },
    Layout: {
      bodyBg: '#F5F5F5',
      headerBg: '#FFFFFF',
      siderBg: '#FFFFFF',
    },
  },
};

