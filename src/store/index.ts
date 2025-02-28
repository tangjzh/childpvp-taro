import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import Taro from '@tarojs/taro'

interface UserInfo {
  id: number
  username: string
  userType: 'admin' | 'parent' | 'child'
  points: number
  avatar?: string
  groupId?: number
}

interface Group {
  id: number
  name: string
  parentId: number
  children: number[]
  created_at: string
}

interface AuthState {
  token: string | null
  userInfo: UserInfo | null
  currentGroup: Group | null
  setToken: (token: string | null) => void
  setUserInfo: (userInfo: UserInfo | null) => void
  setCurrentGroup: (group: Group | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      userInfo: null,
      currentGroup: null,
      setToken: (token) => set({ token }),
      setUserInfo: (userInfo) => set({ userInfo }),
      setCurrentGroup: (group) => set({ currentGroup: group }),
      logout: () => {
        set({ token: null, userInfo: null, currentGroup: null })
        Taro.removeStorageSync('token')
        Taro.removeStorageSync('auth-storage')
        Taro.redirectTo({ url: '/pages/login/index' })
      },
    }),
    {
      name: 'auth-storage',
      storage: {
        getItem: (name: string) => {
          const value = Taro.getStorageSync(name)
          return value ? value : null
        },
        setItem: (name: string, value: unknown) => {
          Taro.setStorageSync(name, value as string)
        },
        removeItem: (name: string) => {
          Taro.removeStorageSync(name)
        },
      },
    }
  )
)

interface TaskState {
  tasks: any[]
  setTasks: (tasks: any[]) => void
  addTask: (task: any) => void
  updateTask: (taskId: number, updates: Partial<any>) => void
  deleteTask: (taskId: number) => void
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (taskId, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task
      ),
    })),
  deleteTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== taskId),
    })),
}))

interface RewardState {
  rewards: any[]
  setRewards: (rewards: any[]) => void
  addReward: (reward: any) => void
  updateReward: (rewardId: number, updates: Partial<any>) => void
  deleteReward: (rewardId: number) => void
}

export const useRewardStore = create<RewardState>((set) => ({
  rewards: [],
  setRewards: (rewards) => set({ rewards }),
  addReward: (reward) => set((state) => ({ rewards: [...state.rewards, reward] })),
  updateReward: (rewardId, updates) =>
    set((state) => ({
      rewards: state.rewards.map((reward) =>
        reward.id === rewardId ? { ...reward, ...updates } : reward
      ),
    })),
  deleteReward: (rewardId) =>
    set((state) => ({
      rewards: state.rewards.filter((reward) => reward.id !== rewardId),
    })),
}))

interface GroupState {
  groups: Group[]
  setGroups: (groups: Group[]) => void
  addGroup: (group: Group) => void
  updateGroup: (groupId: number, updates: Partial<Group>) => void
  deleteGroup: (groupId: number) => void
  joinGroup: (groupId: number) => void
  leaveGroup: (groupId: number) => void
}

export const useGroupStore = create<GroupState>((set) => ({
  groups: [],
  setGroups: (groups) => set({ groups }),
  addGroup: (group) => set((state) => ({ groups: [...state.groups, group] })),
  updateGroup: (groupId, updates) =>
    set((state) => ({
      groups: state.groups.map((group) =>
        group.id === groupId ? { ...group, ...updates } : group
      ),
    })),
  deleteGroup: (groupId) =>
    set((state) => ({
      groups: state.groups.filter((group) => group.id !== groupId),
    })),
  joinGroup: (groupId) =>
    set((state) => {
      const userInfo = useAuthStore.getState().userInfo
      if (!userInfo) return state

      return {
        groups: state.groups.map((group) =>
          group.id === groupId
            ? {
                ...group,
                children: [...group.children, userInfo.id],
              }
            : group
        ),
      }
    }),
  leaveGroup: (groupId) =>
    set((state) => {
      const userInfo = useAuthStore.getState().userInfo
      if (!userInfo) return state

      return {
        groups: state.groups.map((group) =>
          group.id === groupId
            ? {
                ...group,
                children: group.children.filter((id) => id !== userInfo.id),
              }
            : group
        ),
      }
    }),
}))