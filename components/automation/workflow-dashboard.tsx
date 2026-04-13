"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Zap,
  Plus,
  Settings,
  Play,
  Pause,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  Filter,
  Search,
  Calendar,
  Tag,
  FileText,
  Bell,
  Archive,
  Link,
  TrendingUp,
  Activity,
} from "lucide-react"
import { workflowEngine, type WorkflowRule, type WorkflowExecution } from "@/lib/automation/workflow-engine"

interface WorkflowDashboardProps {
  isOpen: boolean
  onClose: () => void
  notes: any[]
}

export function WorkflowDashboard({ isOpen, onClose, notes }: WorkflowDashboardProps) {
  const [activeTab, setActiveTab] = useState<"rules" | "executions" | "analytics">("rules")
  const [rules, setRules] = useState<WorkflowRule[]>([])
  const [executions, setExecutions] = useState<WorkflowExecution[]>([])
  const [analytics, setAnalytics] = useState<any>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEnabled, setFilterEnabled] = useState<boolean | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen])

  const loadData = () => {
    setRules(workflowEngine.getRules())
    setExecutions(workflowEngine.getExecutions())
    setAnalytics(workflowEngine.getAnalytics())
  }

  const toggleRule = (ruleId: string) => {
    const rule = rules.find((r) => r.id === ruleId)
    if (rule) {
      workflowEngine.updateRule(ruleId, { enabled: !rule.enabled })
      loadData()
    }
  }

  const deleteRule = (ruleId: string) => {
    workflowEngine.deleteRule(ruleId)
    loadData()
  }

  const testRule = async (ruleId: string) => {
    // Test rule with a sample note
    const sampleNote = notes[0] || {
      id: 999,
      title: "Test Note for Workflow",
      tags: ["test", "workflow"],
      category: "work",
      date: new Date().toISOString(),
    }

    const results = await workflowEngine.executeWorkflows(sampleNote, "manual", notes)
    console.log("Test results:", results)
    loadData()
  }

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case "add_tag":
        return <Tag className="w-4 h-4" />
      case "set_category":
        return <Filter className="w-4 h-4" />
      case "create_summary":
        return <FileText className="w-4 h-4" />
      case "extract_actions":
        return <CheckCircle className="w-4 h-4" />
      case "link_related":
        return <Link className="w-4 h-4" />
      case "send_notification":
        return <Bell className="w-4 h-4" />
      case "create_reminder":
        return <Clock className="w-4 h-4" />
      case "archive_note":
        return <Archive className="w-4 h-4" />
      default:
        return <Zap className="w-4 h-4" />
    }
  }

  const getTriggerIcon = (triggerType: string) => {
    switch (triggerType) {
      case "note_created":
        return <Plus className="w-4 h-4" />
      case "note_updated":
        return <Settings className="w-4 h-4" />
      case "schedule":
        return <Calendar className="w-4 h-4" />
      default:
        return <Zap className="w-4 h-4" />
    }
  }

  const filteredRules = rules.filter((rule) => {
    const matchesSearch =
      rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterEnabled === null || rule.enabled === filterEnabled
    return matchesSearch && matchesFilter
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="absolute inset-4 md:inset-8 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Workflow Automation</h2>
              <p className="text-sm text-gray-600">Automate your note-taking workflows</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <XCircle className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {[
            { id: "rules", label: "Rules", icon: Settings },
            { id: "executions", label: "History", icon: Activity },
            { id: "analytics", label: "Analytics", icon: BarChart3 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-purple-600 border-b-2 border-purple-600 bg-purple-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            {activeTab === "rules" && (
              <motion.div
                key="rules"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-6"
              >
                {/* Search and Filter */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search rules..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <select
                    value={filterEnabled === null ? "all" : filterEnabled ? "enabled" : "disabled"}
                    onChange={(e) => setFilterEnabled(e.target.value === "all" ? null : e.target.value === "enabled")}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Rules</option>
                    <option value="enabled">Enabled</option>
                    <option value="disabled">Disabled</option>
                  </select>
                  <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    New Rule
                  </button>
                </div>

                {/* Rules List */}
                <div className="space-y-4">
                  {filteredRules.map((rule, index) => (
                    <motion.div
                      key={rule.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 rounded-lg border transition-all ${
                        rule.enabled ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`p-1.5 rounded ${rule.enabled ? "bg-green-100" : "bg-gray-100"}`}>
                              {getTriggerIcon(rule.trigger.type)}
                            </div>
                            <h3 className="font-semibold text-gray-900">{rule.name}</h3>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                rule.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {rule.enabled ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{rule.description}</p>

                          {/* Trigger and Actions */}
                          <div className="flex flex-wrap gap-2 mb-2">
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                              <span>Trigger:</span>
                              <span className="font-medium">{rule.trigger.type.replace("_", " ")}</span>
                            </span>
                            {rule.actions.map((action, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs"
                              >
                                {getActionIcon(action.type)}
                                <span>{action.type.replace("_", " ")}</span>
                              </span>
                            ))}
                          </div>

                          {/* Stats */}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Triggered {rule.triggerCount} times</span>
                            {rule.lastTriggered && <span>Last: {rule.lastTriggered.toLocaleDateString()}</span>}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => testRule(rule.id)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                            title="Test Rule"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleRule(rule.id)}
                            className={`p-2 rounded transition-colors ${
                              rule.enabled ? "text-orange-600 hover:bg-orange-100" : "text-green-600 hover:bg-green-100"
                            }`}
                            title={rule.enabled ? "Disable" : "Enable"}
                          >
                            {rule.enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => deleteRule(rule.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
                            title="Delete Rule"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "executions" && (
              <motion.div
                key="executions"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Executions</h3>
                <div className="space-y-3">
                  {executions.map((execution, index) => {
                    const rule = rules.find((r) => r.id === execution.ruleId)
                    return (
                      <motion.div
                        key={execution.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className={`p-3 rounded-lg border ${
                          execution.status === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {execution.status === "success" ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-600" />
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{rule?.name || "Unknown Rule"}</p>
                              <p className="text-sm text-gray-600">Note ID: {execution.noteId}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">{execution.executedAt.toLocaleString()}</p>
                            {execution.error && <p className="text-xs text-red-600">{execution.error}</p>}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {activeTab === "analytics" && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Workflow Analytics</h3>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{analytics.totalExecutions}</div>
                    <div className="text-sm text-blue-600">Total Executions</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{analytics.successfulExecutions}</div>
                    <div className="text-sm text-green-600">Successful</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">{analytics.failedExecutions}</div>
                    <div className="text-sm text-red-600">Failed</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{Math.round(analytics.successRate)}%</div>
                    <div className="text-sm text-purple-600">Success Rate</div>
                  </div>
                </div>

                {/* Rule Performance */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Rule Performance
                  </h4>
                  <div className="space-y-3">
                    {analytics.ruleStats?.map((stat: any) => (
                      <div key={stat.id} className="flex items-center justify-between p-3 bg-white rounded border">
                        <div>
                          <p className="font-medium text-gray-900">{stat.name}</p>
                          <p className="text-sm text-gray-600">
                            {stat.triggerCount} executions
                            {stat.lastTriggered && ` • Last: ${new Date(stat.lastTriggered).toLocaleDateString()}`}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            stat.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {stat.enabled ? "Active" : "Inactive"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
