import FrequencyGenerator from '@/components/FrequencyGenerator'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900">
      <div className="container mx-auto py-8">
        <FrequencyGenerator />
      </div>
    </div>
  )
}
