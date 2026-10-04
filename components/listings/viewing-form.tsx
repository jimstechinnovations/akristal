'use client'

import { useState } from 'react'
import { ContactFields, Field, LeadForm } from '@/components/forms/lead-form'

export function ViewingForm({ propertyId, agentId, title }: { propertyId: string; agentId: string | null; title: string }) {
  // Earliest bookable date is tomorrow (local time).
  const [minDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().slice(0, 10)
  })
  return (
    <LeadForm
      type="viewing"
      context={{ propertyId, agentId: agentId ?? undefined }}
      submitLabel="Request a viewing"
      successTitle="Viewing requested"
      successText={`We will call you to confirm a time to see ${title}.`}
    >
      <ContactFields compact />
      <div className="grid grid-cols-2 gap-4">
        <Field name="preferred_date" label="Preferred date" type="date" min={minDate} />
        <Field
          as="select"
          name="preferred_time"
          label="Time of day"
          options={[
            { value: '', label: 'Any time' },
            { value: 'Morning', label: 'Morning' },
            { value: 'Afternoon', label: 'Afternoon' },
            { value: 'Evening', label: 'Evening' },
          ]}
        />
      </div>
      <Field
        as="select"
        name="viewing_type"
        label="How would you like to view it?"
        options={[
          { value: 'In person', label: 'In person' },
          { value: 'Video call', label: 'Video call (WhatsApp)' },
        ]}
      />
      <Field as="textarea" name="message" label="Anything we should know?" rows={3} />
    </LeadForm>
  )
}
