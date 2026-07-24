export interface InquiryProgressProps {
  currentStep: 1 | 2 | 3 | 4
}

const steps = ['询价清单', '客户资料', '报价预览', '提交完成']

export function InquiryProgress({ currentStep }: InquiryProgressProps) {
  return (
    <nav className="inquiry-progress" aria-label="询价流程">
      <ol>
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const state =
            stepNumber < currentStep
              ? 'complete'
              : stepNumber === currentStep
                ? 'current'
                : 'upcoming'

          return (
            <li
              aria-current={state === 'current' ? 'step' : undefined}
              className={`inquiry-progress__step inquiry-progress__step--${state}`}
              key={step}
            >
              <span>{String(stepNumber).padStart(2, '0')}</span>
              <strong>{step}</strong>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
