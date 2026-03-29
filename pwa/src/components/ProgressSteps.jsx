import { useEffect, useState } from 'react'
import { Check, Loader2 } from 'lucide-react'

const STEPS = [
  { id: 1, label: 'Verification du cabinet', delay: 0 },
  { id: 2, label: 'Extraction des donnees', delay: 1000 },
  { id: 3, label: 'Consultation base juridique', delay: 9000 },
  { id: 4, label: 'Redaction de l\'acte', delay: 13000 },
  { id: 5, label: 'Generation document Word', delay: 44000 },
]

export default function ProgressSteps({ done }) {
  const [currentStep, setCurrentStep] = useState(1)

  useEffect(() => {
    const timers = STEPS.slice(1).map(step =>
      setTimeout(() => {
        if (!done) setCurrentStep(s => Math.max(s, step.id))
      }, step.delay)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    if (done) setCurrentStep(6)
  }, [done])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {STEPS.map(step => {
        const completed = done || currentStep > step.id
        const active = !done && currentStep === step.id
        return (
          <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Circle */}
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: completed ? 'var(--gold)' : active ? 'transparent' : 'var(--elevated)',
              border: active ? '2px solid var(--gold)' : completed ? 'none' : '1px solid var(--border)',
              flexShrink: 0,
            }}>
              {completed ? (
                <Check size={14} color="#08080f" strokeWidth={2.5} />
              ) : active ? (
                <Loader2 size={14} color="var(--gold)" className="animate-spin-slow" />
              ) : (
                <span style={{ fontSize: 11, color: 'var(--dim)' }}>{step.id}</span>
              )}
            </div>
            {/* Label */}
            <div>
              <div style={{
                fontSize: 13,
                color: completed ? 'var(--text)' : active ? 'var(--gold)' : 'var(--muted)',
                fontWeight: active ? 500 : 400,
              }}>
                {step.label}
              </div>
              {active && (
                <div style={{ fontSize: 11, color: 'var(--gold)', marginTop: 2, opacity: 0.7 }}>
                  en cours...
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
