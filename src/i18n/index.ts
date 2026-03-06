import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      header: {
        onlineAgents: 'Online',
        runningTasks: 'Tasks',
        totalMessages: 'Messages'
      },
      sidebar: {
        chat: 'Chat',
        log: 'Log',
        stats: 'Stats',
        sendMessage: 'Send message...',
        workTime: 'Work Time',
        messagesToday: 'Messages Today',
        tasksCompleted: 'Tasks Done'
      },
      agents: {
        main: 'CEO',
        'code-expert': 'Tech Lead',
        'financial-analyst': 'Finance',
        'materials-scientist': 'R&D',
        'political-analyst': 'Strategy',
        zhihu: 'Operations'
      },
      tasks: {
        research: 'Research',
        writeReport: 'Write Report',
        analyze: 'Analyze',
        brainstorm: 'Brainstorm'
      },
      states: {
        idle: 'Idle',
        thinking: 'Thinking',
        working: 'Working',
        chatting: 'Chatting',
        offline: 'Offline'
      },
      rooms: {
        lobby: 'Lobby',
        meeting: 'Meeting Room',
        ceo: 'CEO Office',
        tech: 'Tech Dept',
        finance: 'Finance Dept',
        rd: 'R&D Dept',
        strategy: 'Strategy Dept',
        ops: 'Operations'
      }
    }
  },
  zh: {
    translation: {
      header: {
        onlineAgents: '在线',
        runningTasks: '任务',
        totalMessages: '消息'
      },
      sidebar: {
        chat: '对话',
        log: '日志',
        stats: '统计',
        sendMessage: '发送消息...',
        workTime: '工作时间',
        messagesToday: '今日消息',
        tasksCompleted: '完成任务'
      },
      agents: {
        main: 'CEO',
        'code-expert': '技术总监',
        'financial-analyst': '财务总监',
        'materials-scientist': '研发总监',
        'political-analyst': '战略总监',
        zhihu: '运营总监'
      },
      tasks: {
        research: '查资料',
        writeReport: '写报告',
        analyze: '分析数据',
        brainstorm: '头脑风暴'
      },
      states: {
        idle: '空闲',
        thinking: '思考中',
        working: '工作中',
        chatting: '对话中',
        offline: '离线'
      },
      rooms: {
        lobby: '大厅',
        meeting: '会议室',
        ceo: 'CEO办公室',
        tech: '技术部',
        finance: '财务部',
        rd: '研发部',
        strategy: '战略部',
        ops: '运营部'
      }
    }
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'zh',
    fallbackLng: 'zh',
    interpolation: {
      escapeValue: false
    }
  })

export default i18n
