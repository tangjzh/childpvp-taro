export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/login/index',
    'pages/register/index',
    'pages/task/index',
    'pages/task/create/index',
    'pages/reward/index',
    'pages/reward/create/index',
    'pages/leaderboard/index',
    'pages/admin/index',
    'pages/profile/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'ChildPVP',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#999',
    selectedColor: '#1677ff',
    backgroundColor: '#fff',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页',
        iconPath: './assets/icons/home.svg',
        selectedIconPath: './assets/icons/home-active.svg'
      },
      {
        pagePath: 'pages/task/index',
        text: '任务',
        iconPath: './assets/icons/task.svg',
        selectedIconPath: './assets/icons/task-active.svg'
      },
      {
        pagePath: 'pages/reward/index',
        text: '奖励',
        iconPath: './assets/icons/reward.svg',
        selectedIconPath: './assets/icons/reward-active.svg'
      },
      {
        pagePath: 'pages/leaderboard/index',
        text: '排行榜',
        iconPath: './assets/icons/leaderboard.svg',
        selectedIconPath: './assets/icons/leaderboard-active.svg'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: './assets/icons/profile.svg',
        selectedIconPath: './assets/icons/profile-active.svg'
      }
    ]
  }
})
