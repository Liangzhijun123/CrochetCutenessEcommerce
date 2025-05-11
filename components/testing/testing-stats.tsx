import { Sparkles, Award, BarChart3, Clock } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface TestingStatsProps {
  level: number
  xp: number
  nextLevelXP: number
}

export default function TestingStats({ level, xp, nextLevelXP }: TestingStatsProps) {
  const progress = (xp / nextLevelXP) * 100

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-lg border border-amber-200 shadow-sm relative overflow-hidden">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-amber-800 text-sm font-medium">Tester Level</h3>
            <p className="text-3xl font-bold text-amber-900">Level {level}</p>
          </div>
          <Sparkles className="h-6 w-6 text-amber-500" />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-amber-700">{xp} XP</span>
            <span className="text-amber-700">{nextLevelXP} XP</span>
          </div>
          <Progress value={progress} className="h-2 bg-amber-200" indicatorClassName="bg-amber-500" />
        </div>
        <p className="text-xs text-amber-700 mt-2">
          {nextLevelXP - xp} XP needed for Level {level + 1}
        </p>
        <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-amber-200 rounded-full opacity-20"></div>
      </div>

      <div className="bg-gradient-to-br from-rose-50 to-rose-100 p-6 rounded-lg border border-rose-200 shadow-sm relative overflow-hidden">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-rose-800 text-sm font-medium">Patterns Tested</h3>
            <p className="text-3xl font-bold text-rose-900">27</p>
          </div>
          <Award className="h-6 w-6 text-rose-500" />
        </div>
        <p className="text-rose-700 text-sm mt-2">You've completed 27 pattern tests</p>
        <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-rose-200 rounded-full opacity-20"></div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200 shadow-sm relative overflow-hidden">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-blue-800 text-sm font-medium">Average Rating</h3>
            <p className="text-3xl font-bold text-blue-900">4.8/5</p>
          </div>
          <BarChart3 className="h-6 w-6 text-blue-500" />
        </div>
        <p className="text-blue-700 text-sm mt-2">From 36 designer ratings</p>
        <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-blue-200 rounded-full opacity-20"></div>
      </div>

      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-lg border border-emerald-200 shadow-sm relative overflow-hidden">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-emerald-800 text-sm font-medium">In Progress</h3>
            <p className="text-3xl font-bold text-emerald-900">3</p>
          </div>
          <Clock className="h-6 w-6 text-emerald-500" />
        </div>
        <p className="text-emerald-700 text-sm mt-2">Patterns in your testing queue</p>
        <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-emerald-200 rounded-full opacity-20"></div>
      </div>
    </div>
  )
}
